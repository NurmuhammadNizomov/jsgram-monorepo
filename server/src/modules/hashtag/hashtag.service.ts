import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Hashtag, HashtagDocument } from '../../models/hashtag.model';

@Injectable()
export class HashtagService {
  constructor(
    @InjectModel(Hashtag.name) private hashtagModel: Model<HashtagDocument>,
  ) {}

  /** Extract #tags from post content and upsert counts */
  async syncFromContent(content: string): Promise<void> {
    const tags = this.extractTags(content);
    if (!tags.length) return;

    await Promise.all(
      tags.map((tag) =>
        this.hashtagModel.findOneAndUpdate(
          { tag },
          { $inc: { postsCount: 1 }, $set: { lastUsedAt: new Date() } },
          { upsert: true, new: true },
        ),
      ),
    );
  }

  /** Decrement counts when post is deleted */
  async decrementFromContent(content: string): Promise<void> {
    const tags = this.extractTags(content);
    if (!tags.length) return;
    await this.hashtagModel.updateMany(
      { tag: { $in: tags } },
      { $inc: { postsCount: -1 } },
    );
  }

  /** Top trending hashtags */
  async getTrending(limit = 20) {
    return this.hashtagModel
      .find({ postsCount: { $gt: 0 } })
      .sort({ postsCount: -1, lastUsedAt: -1 })
      .limit(limit)
      .lean();
  }

  /** Search hashtags by prefix */
  async search(q: string, limit = 10) {
    const regex = new RegExp(`^${q.replace('#', '')}`, 'i');
    return this.hashtagModel
      .find({ tag: regex, postsCount: { $gt: 0 } })
      .sort({ postsCount: -1 })
      .limit(limit)
      .lean();
  }

  private extractTags(content: string): string[] {
    const matches = content.match(/#([a-zA-Z0-9_]+)/g) ?? [];
    const tags = matches
      .map((t) => t.slice(1).toLowerCase())
      .filter((t) => t.length >= 2 && t.length <= 50);
    return [...new Set(tags)]; // deduplicate
  }
}
