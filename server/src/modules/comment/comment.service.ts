import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from '../../models/comment.model';
import { Post, PostDocument } from '../../models/post.model';
import { CreateCommentDto } from './dto/create-comment.dto';
import { NotificationService } from '../notification/notification.service';
import { NotificationGateway } from '../notification/notification.gateway';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    private readonly notifService: NotificationService,
    private readonly notifGateway: NotificationGateway,
  ) {}

  async create(postId: string, userId: string, dto: CreateCommentDto): Promise<CommentDocument> {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post not found');

    if (dto.parentComment) {
      const parent = await this.commentModel.findById(dto.parentComment);
      if (!parent || parent.post.toString() !== postId) {
        throw new NotFoundException('Parent comment not found');
      }
    }

    const comment = await this.commentModel.create({
      post: postId,
      author: userId,
      text: dto.text,
      parentComment: dto.parentComment ?? null,
    });

    await this.postModel.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

    // Notify: comment on post → post author; reply → parent comment author
    const notifType = dto.parentComment ? 'reply' : 'comment';
    const recipientId = dto.parentComment
      ? (await this.commentModel.findById(dto.parentComment).select('author').lean())?.author?.toString()
      : post.author.toString();

    if (recipientId) {
      const notif = await this.notifService.create({
        recipient: recipientId,
        sender: userId,
        type: notifType,
        post: postId,
        comment: comment._id.toString(),
      });
      if (notif) {
        this.notifGateway.sendToUser(recipientId, notif);
        const count = await this.notifService.getUnreadCount(recipientId);
        this.notifGateway.sendUnreadCount(recipientId, count);
      }
    }

    return comment.populate('author', 'username firstName lastName avatar');
  }

  async getByPost(postId: string, page = 1, limit = 20) {
    const post = await this.postModel.findById(postId).lean();
    if (!post) throw new NotFoundException('Post not found');

    const skip = (page - 1) * limit;

    // Top-level comments only
    const comments = await this.commentModel
      .find({ post: postId, parentComment: null })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username firstName lastName avatar')
      .lean();

    // Attach replies count for each comment
    const commentIds = comments.map((c) => c._id);
    const replyCounts = await this.commentModel.aggregate([
      { $match: { parentComment: { $in: commentIds } } },
      { $group: { _id: '$parentComment', count: { $sum: 1 } } },
    ]);
    const replyMap = new Map(replyCounts.map((r) => [r._id.toString(), r.count]));

    return comments.map((c) => ({
      ...c,
      repliesCount: replyMap.get(c._id.toString()) ?? 0,
    }));
  }

  async getReplies(commentId: string, page = 1, limit = 20) {
    const parent = await this.commentModel.findById(commentId);
    if (!parent) throw new NotFoundException('Comment not found');

    const skip = (page - 1) * limit;
    return this.commentModel
      .find({ parentComment: commentId })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username firstName lastName avatar')
      .lean();
  }

  async delete(commentId: string, userId: string): Promise<void> {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.author.toString() !== userId) throw new ForbiddenException();

    // Count replies to subtract from post commentsCount
    const repliesCount = await this.commentModel.countDocuments({ parentComment: commentId });
    await this.commentModel.deleteMany({ parentComment: commentId });
    await comment.deleteOne();

    await this.postModel.findByIdAndUpdate(comment.post, {
      $inc: { commentsCount: -(1 + repliesCount) },
    });
  }
}
