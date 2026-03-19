import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Conversation' })
  conversationId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  sender: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 4000 })
  text: string;

  @Prop({
    type: {
      storyId: { type: Types.ObjectId, ref: 'Story' },
      mediaUrl: String,
      mediaType: { type: String, enum: ['image', 'video'] },
    },
    default: null,
  })
  storyReply: { storyId: Types.ObjectId; mediaUrl: string; mediaType: string } | null;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  readBy: Types.ObjectId[];
}

export const MessageSchema = SchemaFactory.createForClass(Message);

MessageSchema.index({ conversationId: 1, createdAt: -1 });
