import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Conversation, ConversationDocument } from '../../models/conversation.model';
import { Message, MessageDocument } from '../../models/message.model';
import { User, UserDocument } from '../../models/user.model';
import { BlockService } from '../block/block.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly blockService: BlockService,
  ) {}

  // Get or create 1-to-1 conversation
  async getOrCreateConversation(userId: string, participantId: string) {
    if (userId === participantId) throw new ForbiddenException('Cannot chat with yourself');

    const me = new Types.ObjectId(userId);
    const other = new Types.ObjectId(participantId);

    const existing = await this.conversationModel.find({
      participants: { $all: [me, other], $size: 2 },
    }).populate('participants', 'username firstName lastName avatar isOnline lastSeen')
      .populate({ path: 'lastMessage', select: 'text sender createdAt' })
      .sort({ lastMessageAt: -1, createdAt: -1 });

    if (existing.length > 1) {
      // remove duplicate conversations (keep the first/newest)
      const [keep, ...dupes] = existing;
      await this.conversationModel.deleteMany({ _id: { $in: dupes.map(d => d._id) } });
      return keep;
    }

    if (existing.length === 1) return existing[0];

    const target = await this.userModel.findById(participantId);
    if (!target) throw new NotFoundException('User not found');

    const conversation = await this.conversationModel.create({ participants: [me, other] });
    return conversation.populate('participants', 'username firstName lastName avatar isOnline lastSeen');
  }

  // Get all conversations for a user (deduplicated by other participant)
  async getConversations(userId: string) {
    const me = new Types.ObjectId(userId);
    const [conversations, blockedIds] = await Promise.all([
      this.conversationModel
        .find({ participants: me })
        .populate('participants', 'username firstName lastName avatar isOnline lastSeen')
        .populate({ path: 'lastMessage', select: 'text sender createdAt readBy' })
        .sort({ lastMessageAt: -1, createdAt: -1 }),
      this.blockService.getBlockedIds(userId),
    ]);

    const blockedSet = new Set(blockedIds.map((id) => id.toString()));

    // deduplicate: keep only the first (most recent) conversation per other participant
    const seen = new Set<string>();
    return conversations
      .filter(c => {
        const other = c.participants.find(p => p._id.toString() !== userId);
        if (!other) return true;
        const key = other._id.toString();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map(c => {
        const other = c.participants.find(p => p._id.toString() !== userId);
        const isBlocked = other ? blockedSet.has(other._id.toString()) : false;
        return Object.assign(c.toObject ? c.toObject() : c, { isBlocked });
      });
  }

  // Get messages in a conversation
  async getMessages(conversationId: string, userId: string, page = 1, limit = 50) {
    const convo = await this.conversationModel.findOne({
      _id: conversationId,
      participants: new Types.ObjectId(userId),
    });
    if (!convo) throw new ForbiddenException('Not a participant');

    const skip = (page - 1) * limit;
    const messages = await this.messageModel
      .find({ conversationId: new Types.ObjectId(conversationId) })
      .populate('sender', 'username firstName lastName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Mark messages as read
    await this.messageModel.updateMany(
      {
        conversationId: new Types.ObjectId(conversationId),
        readBy: { $ne: new Types.ObjectId(userId) },
        sender: { $ne: new Types.ObjectId(userId) },
      },
      { $addToSet: { readBy: new Types.ObjectId(userId) } },
    );

    return messages.reverse();
  }

  // Save a new message — also used for direct userId send (lazy conversation creation)
  async saveMessageToUser(
    senderId: string,
    recipientId: string,
    text: string,
    storyReply?: { storyId: string; mediaUrl: string; mediaType: string },
  ) {
    const convo = await this.getOrCreateConversation(senderId, recipientId);
    return this.saveMessage(convo._id.toString(), senderId, text, storyReply);
  }

  // Save a new message (called from gateway)
  async saveMessage(
    conversationId: string,
    senderId: string,
    text: string,
    storyReply?: { storyId: string; mediaUrl: string; mediaType: string },
  ) {
    const convo = await this.conversationModel.findOne({
      _id: conversationId,
      participants: new Types.ObjectId(senderId),
    });
    if (!convo) throw new ForbiddenException('Not a participant');

    const message = await this.messageModel.create({
      conversationId: new Types.ObjectId(conversationId),
      sender: new Types.ObjectId(senderId),
      text,
      storyReply: storyReply ?? null,
      readBy: [new Types.ObjectId(senderId)],
    });

    // Update conversation's last message
    await this.conversationModel.updateOne(
      { _id: conversationId },
      { lastMessage: message._id, lastMessageAt: new Date() },
    );

    await message.populate('sender', 'username firstName lastName avatar');
    return message;
  }

  async markOnline(userId: string) {
    await this.userModel.updateOne(
      { _id: userId },
      { isOnline: true, lastSeen: new Date() },
    );
  }

  async markOffline(userId: string) {
    await this.userModel.updateOne(
      { _id: userId },
      { isOnline: false, lastSeen: new Date() },
    );
  }
}
