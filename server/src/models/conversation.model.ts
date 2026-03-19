import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ConversationDocument = Conversation & Document;

@Schema({ timestamps: true })
export class Conversation {
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], required: true })
  participants: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Message', default: null })
  lastMessage: Types.ObjectId | null;

  @Prop({ type: Date, default: null })
  lastMessageAt: Date | null;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);

// Fast lookup: find conversation between two users
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ lastMessageAt: -1 });
