import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StoryDocument = Story & Document;

@Schema({ timestamps: true })
export class Story {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  author: Types.ObjectId;

  @Prop({ required: true })
  mediaUrl: string;

  @Prop({ required: true })
  mediaPublicId: string;

  @Prop({ default: 'image', enum: ['image', 'video'] })
  mediaType: string;

  @Prop({ trim: true, maxlength: 200, default: '' })
  caption: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  viewedBy: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  likes: Types.ObjectId[];

  // No TTL — stories stay indefinitely (can be deleted manually)
  @Prop({ type: Date, default: () => new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000) })
  expiresAt: Date;
}

export const StorySchema = SchemaFactory.createForClass(Story);
StorySchema.index({ author: 1, createdAt: -1 });
// TTL index intentionally removed — stories don't auto-expire
