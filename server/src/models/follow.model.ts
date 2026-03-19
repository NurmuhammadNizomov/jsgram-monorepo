import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FollowDocument = Follow & Document;

@Schema({ timestamps: true })
export class Follow {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  follower: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  following: Types.ObjectId;
}

export const FollowSchema = SchemaFactory.createForClass(Follow);

FollowSchema.index({ follower: 1, following: 1 }, { unique: true });
FollowSchema.index({ follower: 1 });
FollowSchema.index({ following: 1 });
