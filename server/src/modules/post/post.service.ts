import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post, PostDocument } from '../../models/post.model';
import { Like, LikeDocument } from '../../models/like.model';
import { Bookmark, BookmarkDocument } from '../../models/bookmark.model';
import { Follow, FollowDocument } from '../../models/follow.model';
import { CreatePostDto } from './dto/create-post.dto';
import { UploadService } from '../upload/upload.service';
import { NotificationService } from '../notification/notification.service';
import { NotificationGateway } from '../notification/notification.gateway';
import { HashtagService } from '../hashtag/hashtag.service';
import { BlockService } from '../block/block.service';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Like.name) private likeModel: Model<LikeDocument>,
    @InjectModel(Bookmark.name) private bookmarkModel: Model<BookmarkDocument>,
    @InjectModel(Follow.name) private followModel: Model<FollowDocument>,
    private readonly uploadService: UploadService,
    private readonly notifService: NotificationService,
    private readonly notifGateway: NotificationGateway,
    private readonly hashtagService: HashtagService,
    private readonly blockService: BlockService,
  ) {}

  async create(userId: string, dto: CreatePostDto): Promise<PostDocument> {
    if (!dto.content?.trim() && (!dto.images || dto.images.length === 0)) {
      throw new BadRequestException('Post must have content or image');
    }
    const post = await this.postModel.create({ author: new Types.ObjectId(userId), ...dto });
    if (dto.content) this.hashtagService.syncFromContent(dto.content).catch(() => null);
    return post;
  }

  async getFeed(userId: string, page = 1, limit = 20) {
    const [following, blockedIds] = await Promise.all([
      this.followModel.find({ follower: new Types.ObjectId(userId) }).select('following').lean(),
      this.blockService.getMutualBlockIds(userId),
    ]);
    const followingIds = following.map((f) => f.following as Types.ObjectId);
    // Include both ObjectId and string variants for legacy string-stored authors
    const authorIds = [
      new Types.ObjectId(userId), userId,
      ...followingIds,
      ...followingIds.map((id) => id.toString()),
    ];

    const skip = (page - 1) * limit;
    const userObjId = new Types.ObjectId(userId);
    const posts = await this.postModel
      .find({
        author: { $in: authorIds, $nin: blockedIds },
        $or: [
          { author: { $in: [userObjId, userId] } }, // own posts — always visible
          { visibility: { $ne: 'private' } },        // others — not private
        ],
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username firstName lastName avatar isOnline')
      .lean();

    return this._attachMeta(posts, userId);
  }

  async getExplorePosts(userId: string, page = 1, limit = 20) {
    const blockedIds = await this.blockService.getMutualBlockIds(userId);
    const skip = (page - 1) * limit;
    const posts = await this.postModel
      .find({ visibility: 'public', 'images.0': { $exists: true }, author: { $nin: blockedIds } })
      .sort({ likesCount: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username firstName lastName avatar isOnline')
      .lean();
    return this._attachMeta(posts, userId);
  }

  async getUserPosts(targetUserId: string, viewerId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const isOwner = targetUserId === viewerId;
    const visibilityFilter = isOwner
      ? {}
      : { visibility: { $ne: 'private' } };

    const posts = await this.postModel
      .find({ author: { $in: [new Types.ObjectId(targetUserId), targetUserId] }, ...visibilityFilter })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username firstName lastName avatar isOnline')
      .lean();
    return this._attachMeta(posts, viewerId);
  }

  async getById(postId: string, userId: string) {
    const post = await this.postModel
      .findById(postId)
      .populate('author', 'username firstName lastName avatar isOnline')
      .lean();
    if (!post) throw new NotFoundException('Post not found');
    const [enriched] = await this._attachMeta([post], userId);
    return enriched;
  }

  async update(postId: string, userId: string, content: string) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post not found');
    if (post.author.toString() !== userId) throw new ForbiddenException();
    post.content = content?.trim() ?? post.content;
    await post.save();
    return post.populate('author', 'username firstName lastName avatar isOnline');
  }

  async delete(postId: string, userId: string): Promise<void> {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post not found');
    if (post.author.toString() !== userId) throw new ForbiddenException();
    if (post.content) this.hashtagService.decrementFromContent(post.content).catch(() => null);

    // delete images from cloudinary
    for (const img of post.images) {
      if (img.publicId) {
        await this.uploadService.deleteImage(img.publicId).catch(() => null);
      }
    }

    await post.deleteOne();
    await this.likeModel.deleteMany({ post: postId });
    await this.bookmarkModel.deleteMany({ post: postId });
  }

  async toggleLike(postId: string, userId: string) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post not found');

    const existing = await this.likeModel.findOne({ post: postId, user: userId });
    if (existing) {
      await existing.deleteOne();
      await this.postModel.findByIdAndUpdate(postId, { $inc: { likesCount: -1 } });
      return { liked: false };
    }
    await this.likeModel.create({ post: postId, user: userId });
    await this.postModel.findByIdAndUpdate(postId, { $inc: { likesCount: 1 } });

    // Notify post author
    const notif = await this.notifService.create({
      recipient: post.author.toString(),
      sender: userId,
      type: 'like',
      post: postId,
    });
    if (notif) {
      this.notifGateway.sendToUser(post.author.toString(), notif);
      const count = await this.notifService.getUnreadCount(post.author.toString());
      this.notifGateway.sendUnreadCount(post.author.toString(), count);
    }

    return { liked: true };
  }

  async toggleBookmark(postId: string, userId: string) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post not found');

    const existing = await this.bookmarkModel.findOne({ post: postId, user: userId });
    if (existing) {
      await existing.deleteOne();
      await this.postModel.findByIdAndUpdate(postId, { $inc: { bookmarksCount: -1 } });
      return { bookmarked: false };
    }
    await this.bookmarkModel.create({ post: postId, user: userId });
    await this.postModel.findByIdAndUpdate(postId, { $inc: { bookmarksCount: 1 } });
    return { bookmarked: true };
  }

  async getBookmarks(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const bookmarks = await this.bookmarkModel
      .find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'post',
        populate: { path: 'author', select: 'username firstName lastName avatar isOnline' },
      })
      .lean();

    const posts = bookmarks.map((b) => b.post).filter(Boolean);
    return this._attachMeta(posts as any[], userId);
  }

  private async _attachMeta(posts: any[], userId: string) {
    if (!posts.length) return [];
    const postIds = posts.map((p) => p._id);

    const [likes, bookmarks] = await Promise.all([
      this.likeModel.find({ user: userId, post: { $in: postIds } }).select('post').lean(),
      this.bookmarkModel.find({ user: userId, post: { $in: postIds } }).select('post').lean(),
    ]);

    const likedSet = new Set(likes.map((l) => l.post.toString()));
    const bookmarkedSet = new Set(bookmarks.map((b) => b.post.toString()));

    return posts.map((p) => ({
      ...p,
      isLiked: likedSet.has(p._id.toString()),
      isBookmarked: bookmarkedSet.has(p._id.toString()),
    }));
  }
}
