import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Conversation, ConversationDocument } from '../../models/conversation.model';
import { Message, MessageDocument } from '../../models/message.model';
import { User, UserDocument } from '../../models/user.model';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  // Get or create 1-to-1 conversation
  async getOrCreateConversation(userId: string, participantId: string) {
    if (userId === participantId) throw new ForbiddenException('Cannot chat with yourself');

    const me = new Types.ObjectId(userId);
    const other = new Types.ObjectId(participantId);

    let conversation = await this.conversationModel.findOne({
      participants: { $all: [me, other], $size: 2 },
    }).populate('participants', 'username firstName lastName avatar isOnline lastSeen')
      .populate({ path: 'lastMessage', select: 'text sender createdAt' });

    if (!conversation) {
      const target = await this.userModel.findById(participantId);
      if (!target) throw new NotFoundException('User not found');

      conversation = await this.conversationModel.create({ participants: [me, other] });
      conversation = await conversation.populate('participants', 'username firstName lastName avatar isOnline lastSeen');
    }

    return conversation;
  }

  // Get all conversations for a user
  async getConversations(userId: string) {
    const me = new Types.ObjectId(userId);
    const conversations = await this.conversationModel
      .find({ participants: me })
      .populate('participants', 'username firstName lastName avatar isOnline lastSeen')
      .populate({ path: 'lastMessage', select: 'text sender createdAt readBy' })
      .sort({ lastMessageAt: -1, createdAt: -1 });

    return conversations;
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

  // Save a new message (called from gateway)
  async saveMessage(conversationId: string, senderId: string, text: string) {
    const convo = await this.conversationModel.findOne({
      _id: conversationId,
      participants: new Types.ObjectId(senderId),
    });
    if (!convo) throw new ForbiddenException('Not a participant');

    const message = await this.messageModel.create({
      conversationId: new Types.ObjectId(conversationId),
      sender: new Types.ObjectId(senderId),
      text,
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
