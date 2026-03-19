import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Follow, FollowDocument } from '../../models/follow.model';
import { User, UserDocument } from '../../models/user.model';

@Injectable()
export class FollowService {
  constructor(
    @InjectModel(Follow.name) private followModel: Model<FollowDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async follow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    const target = await this.userModel.findById(followingId);
    if (!target) throw new NotFoundException('User not found');

    const existing = await this.followModel.findOne({
      follower: new Types.ObjectId(followerId),
      following: new Types.ObjectId(followingId),
    });
    if (existing) throw new BadRequestException('Already following');

    await this.followModel.create({
      follower: new Types.ObjectId(followerId),
      following: new Types.ObjectId(followingId),
    });

    return { message: 'Followed successfully' };
  }

  async unfollow(followerId: string, followingId: string) {
    const result = await this.followModel.deleteOne({
      follower: new Types.ObjectId(followerId),
      following: new Types.ObjectId(followingId),
    });
    if (result.deletedCount === 0) throw new BadRequestException('Not following');
    return { message: 'Unfollowed successfully' };
  }

  async getFollowers(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const follows = await this.followModel
      .find({ following: new Types.ObjectId(userId) })
      .populate('follower', 'username firstName lastName avatar isOnline lastSeen')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await this.followModel.countDocuments({ following: new Types.ObjectId(userId) });
    return { data: follows.map(f => f.follower), total, page, limit };
  }

  async getFollowing(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const follows = await this.followModel
      .find({ follower: new Types.ObjectId(userId) })
      .populate('following', 'username firstName lastName avatar isOnline lastSeen')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await this.followModel.countDocuments({ follower: new Types.ObjectId(userId) });
    return { data: follows.map(f => f.following), total, page, limit };
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
