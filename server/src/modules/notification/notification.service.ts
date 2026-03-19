import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument, NotificationType } from '../../models/notification.model';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notifModel: Model<NotificationDocument>,
  ) {}

  async create(data: {
    recipient: string;
    sender: string;
    type: NotificationType;
    post?: string;
    comment?: string;
  }): Promise<NotificationDocument | null> {
    // Don't notify yourself
    if (data.recipient === data.sender) return null;

    // Deduplicate: skip if same notif already exists and unread
    const existing = await this.notifModel.findOne({
      recipient: data.recipient,
      sender: data.sender,
      type: data.type,
      post: data.post ?? null,
      isRead: false,
    });
    if (existing) return existing;

    const notif = await this.notifModel.create({
      recipient: data.recipient,
      sender: data.sender,
      type: data.type,
      post: data.post ? new Types.ObjectId(data.post) : null,
      comment: data.comment ? new Types.ObjectId(data.comment) : null,
    });

    return notif.populate([
      { path: 'sender', select: 'username firstName lastName avatar' },
      { path: 'post', select: '_id content images' },
    ]);
  }

  async getForUser(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return this.notifModel
      .find({ recipient: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'username firstName lastName avatar')
      .populate('post', '_id content images')
      .lean();
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notifModel.countDocuments({ recipient: userId, isRead: false });
  }

  async markAllRead(userId: string): Promise<void> {
    await this.notifModel.updateMany({ recipient: userId, isRead: false }, { isRead: true });
  }

  async markRead(notifId: string, userId: string): Promise<void> {
    await this.notifModel.updateOne({ _id: notifId, recipient: userId }, { isRead: true });
  }

  async deleteOne(notifId: string, userId: string): Promise<void> {
    await this.notifModel.deleteOne({ _id: notifId, recipient: userId });
  }
}
