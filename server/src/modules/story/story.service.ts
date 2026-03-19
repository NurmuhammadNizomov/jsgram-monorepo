import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Story, StoryDocument } from '../../models/story.model';
import { Follow, FollowDocument } from '../../models/follow.model';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class StoryService {
  constructor(
    @InjectModel(Story.name) private storyModel: Model<StoryDocument>,
    @InjectModel(Follow.name) private followModel: Model<FollowDocument>,
    private readonly uploadService: UploadService,
  ) {}

  async create(userId: string, file: Express.Multer.File, caption = '') {
    const result = await this.uploadService.uploadMedia(file, 'jsgram/stories');
    const mediaType = file.mimetype.startsWith('video/') ? 'video' : 'image';

    const story = await this.storyModel.create({
      author: new Types.ObjectId(userId),
      mediaUrl: result.secure_url,
      mediaPublicId: result.public_id,
      mediaType,
      caption,
    });

    return story.populate('author', 'username firstName lastName avatar');
  }

  /** Feed stories: own + following, grouped by author */
  async getFeedStories(userId: string) {
    const uid = new Types.ObjectId(userId);

    const following = await this.followModel
      .find({ follower: uid })
      .select('following')
      .lean();

    const followingIds = following.map((f) => f.following as Types.ObjectId);
    // Support legacy string-stored authors alongside ObjectId
    const authorIds: (Types.ObjectId | string)[] = [
      uid, userId,
      ...followingIds,
      ...followingIds.map((id) => id.toString()),
    ];

    const stories = await this.storyModel.aggregate([
      { $match: { author: { $in: authorIds } } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'users',
          let: { authorId: '$author' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', { $toObjectId: '$$authorId' }] } } },
            { $project: { _id: 1, username: 1, firstName: 1, lastName: 1, avatar: 1 } },
          ],
          as: 'authorData',
        },
      },
      { $unwind: '$authorData' },
      {
        $addFields: {
          author: '$authorData',
          isViewed: { $in: [uid, { $ifNull: ['$viewedBy', []] }] },
          isLiked: { $in: [uid, { $ifNull: ['$likes', []] }] },
          likesCount: { $size: { $ifNull: ['$likes', []] } },
        },
      },
      { $project: { authorData: 0, likes: 0, viewedBy: 0 } },
    ]);

    // Group by author
    const map = new Map<string, { author: any; stories: any[]; hasUnread: boolean }>();
    for (const story of stories) {
      const authorId = story.author._id.toString();
      if (!map.has(authorId)) {
        map.set(authorId, { author: story.author, stories: [], hasUnread: false });
      }
      const group = map.get(authorId)!;
      if (!story.isViewed) group.hasUnread = true;
      group.stories.push(story);
    }

    return Array.from(map.values());
  }

  async markViewed(storyId: string, userId: string) {
    await this.storyModel.findByIdAndUpdate(storyId, {
      $addToSet: { viewedBy: new Types.ObjectId(userId) },
    });
  }

  async toggleLike(storyId: string, userId: string) {
    const uid = new Types.ObjectId(userId);

    // Try to remove like (if it exists)
    const removed = await this.storyModel.findOneAndUpdate(
      { _id: new Types.ObjectId(storyId), likes: uid },
      { $pull: { likes: uid } },
      { new: true },
    );
    if (removed) {
      return { liked: false, likesCount: removed.likes.length };
    }

    // Add like
    const added = await this.storyModel.findByIdAndUpdate(
      storyId,
      { $addToSet: { likes: uid } },
      { new: true },
    );
    if (!added) throw new NotFoundException('Story not found');
    return { liked: true, likesCount: added.likes.length };
  }

  async delete(storyId: string, userId: string) {
    const story = await this.storyModel.findById(storyId);
    if (!story) throw new NotFoundException('Story not found');
    if (story.author.toString() !== userId) throw new ForbiddenException();

    await this.uploadService.deleteMedia(story.mediaPublicId, story.mediaType as 'image' | 'video').catch(() => null);
    await story.deleteOne();
    return { message: 'story.deleted' };
  }

  async getMyStories(userId: string) {
    return this.storyModel
      .find({ author: { $in: [new Types.ObjectId(userId), userId] } })
      .sort({ createdAt: -1 })
      .lean();
  }

  /** Get stories of a specific user as a StoryGroup */
  async getByUser(targetUserId: string, viewerId: string) {
    const vid = new Types.ObjectId(viewerId);

    const stories = await this.storyModel.aggregate([
      { $match: { author: { $in: [new Types.ObjectId(targetUserId), targetUserId] } } },
      { $sort: { createdAt: 1 } },
      {
        $lookup: {
          from: 'users',
          let: { authorId: '$author' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', { $toObjectId: '$$authorId' }] } } },
            { $project: { _id: 1, username: 1, firstName: 1, lastName: 1, avatar: 1 } },
          ],
          as: 'authorData',
        },
      },
      { $unwind: '$authorData' },
      {
        $addFields: {
          author: '$authorData',
          isViewed: { $in: [vid, { $ifNull: ['$viewedBy', []] }] },
          isLiked: { $in: [vid, { $ifNull: ['$likes', []] }] },
          likesCount: { $size: { $ifNull: ['$likes', []] } },
        },
      },
      { $project: { authorData: 0, likes: 0, viewedBy: 0 } },
    ]);

    if (!stories.length) return null;

    const hasUnread = stories.some((s) => !s.isViewed);

    return {
      author: stories[0].author,
      hasUnread,
      stories,
    };
  }
}
