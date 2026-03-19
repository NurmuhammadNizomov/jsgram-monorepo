import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HashtagDocument = Hashtag & Document;

@Schema({ timestamps: true })
export class Hashtag {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  tag: string; // without #, e.g. "nextjs"

  @Prop({ default: 0 })
  postsCount: number;

  @Prop({ type: Date, default: Date.now })
  lastUsedAt: Date;
}

export const HashtagSchema = SchemaFactory.createForClass(Hashtag);
HashtagSchema.index({ postsCount: -1, lastUsedAt: -1 }); // for trending query
