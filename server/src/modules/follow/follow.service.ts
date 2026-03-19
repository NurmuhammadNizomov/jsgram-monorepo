import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Follow, FollowDocument } from '../../models/follow.model';
import { User, UserDocument } from '../../models/user.model';
import { NotificationService } from '../notification/notification.service';
import { NotificationGateway } from '../notification/notification.gateway';

@Injectable()
export class FollowService {
  constructor(
    @InjectModel(Follow.name) private followModel: Model<FollowDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly notifService: NotificationService,
    private readonly notifGateway: NotificationGateway,
  ) {}

  async toggle(followerId: string, followingId: string) {
    const existing = await this.followModel.findOne({
      follower: new Types.ObjectId(followerId),
      following: new Types.ObjectId(followingId),
    });

    if (existing) {
      await existing.deleteOne();
      return { following: false };
    }

    await this.followModel.create({
      follower: new Types.ObjectId(followerId),
      following: new Types.ObjectId(followingId),
    });

    const notif = await this.notifService.create({
      recipient: followingId,
      sender: followerId,
      type: 'follow',
    });
    if (notif) {
      this.notifGateway.sendToUser(followingId, notif);
      const count = await this.notifService.getUnreadCount(followingId);
      this.notifGateway.sendUnreadCount(followingId, count);
    }

    return { following: true };
  }

  async getFollowers(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const follows = await this.followModel
      .find({ following: new Types.ObjectId(userId) })
      .populate('follower', 'username firstName lastName avatar isOnline lastSeen')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return follows.map(f => f.follower);
  }

  async getFollowing(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const follows = await this.followModel
      .find({ follower: new Types.ObjectId(userId) })
      .populate('following', 'username firstName lastName avatar isOnline lastSeen')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return follows.map(f => f.following);
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const exists = await this.followModel.exists({
      follower: new Types.ObjectId(followerId),
      following: new Types.ObjectId(followingId),
    });
    return !!exists;
  }

  async getCounts(userId: string) {
    const [followers, following] = await Promise.all([
      this.followModel.countDocuments({ following: new Types.ObjectId(userId) }),
      this.followModel.countDocuments({ follower: new Types.ObjectId(userId) }),
    ]);
    return { followers, following };
  }
}
