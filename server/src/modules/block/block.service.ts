import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Block, BlockDocument } from '../../models/block.model';
import { Follow, FollowDocument } from '../../models/follow.model';

@Injectable()
export class BlockService {
  constructor(
    @InjectModel(Block.name) private blockModel: Model<BlockDocument>,
    @InjectModel(Follow.name) private followModel: Model<FollowDocument>,
  ) {}

  async toggle(blockerId: string, blockedId: string) {
    const existing = await this.blockModel.findOne({
      blocker: new Types.ObjectId(blockerId),
      blocked: new Types.ObjectId(blockedId),
    });

    if (existing) {
      await existing.deleteOne();
      return { blocked: false };
    }

    await this.blockModel.create({
      blocker: new Types.ObjectId(blockerId),
      blocked: new Types.ObjectId(blockedId),
    });

    // Auto-unfollow both directions when blocking
    await this.followModel.deleteMany({
      $or: [
        { follower: new Types.ObjectId(blockerId), following: new Types.ObjectId(blockedId) },
        { follower: new Types.ObjectId(blockedId), following: new Types.ObjectId(blockerId) },
      ],
    });

    return { blocked: true };
  }

  async getBlockedIds(userId: string): Promise<Types.ObjectId[]> {
    const blocks = await this.blockModel
      .find({ blocker: new Types.ObjectId(userId) })
      .select('blocked')
      .lean();
    return blocks.map((b) => b.blocked as Types.ObjectId);
  }

  /** IDs of users who blocked `userId` */
  async getBlockerIds(userId: string): Promise<Types.ObjectId[]> {
    const blocks = await this.blockModel
      .find({ blocked: new Types.ObjectId(userId) })
      .select('blocker')
      .lean();
    return blocks.map((b) => b.blocker as Types.ObjectId);
  }

  /** Both directions: who I blocked + who blocked me */
  async getMutualBlockIds(userId: string): Promise<Types.ObjectId[]> {
    const [blocked, blockers] = await Promise.all([
      this.getBlockedIds(userId),
      this.getBlockerIds(userId),
    ]);
    const seen = new Set<string>();
    const result: Types.ObjectId[] = [];
    for (const id of [...blocked, ...blockers]) {
      const key = id.toString();
      if (!seen.has(key)) { seen.add(key); result.push(id); }
    }
    return result;
  }

  async getBlockedList(userId: string) {
    const blocks = await this.blockModel
      .find({ blocker: new Types.ObjectId(userId) })
      .populate('blocked', 'username firstName lastName avatar')
      .lean();
    return blocks.map((b) => b.blocked);
  }

  async isBlocked(blockerId: string, blockedId: string): Promise<boolean> {
    const exists = await this.blockModel.exists({
      blocker: new Types.ObjectId(blockerId),
      blocked: new Types.ObjectId(blockedId),
    });
    return !!exists;
  }
}
