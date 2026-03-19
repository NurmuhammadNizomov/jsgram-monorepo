import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PostDocument = Post & Document;

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  author: Types.ObjectId;

  @Prop({ trim: true, maxlength: 2000, default: '' })
  content: string;

  @Prop({
    type: [{ url: String, publicId: String }],
    default: [],
  })
  images: { url: string; publicId: string }[];

  @Prop({ default: 0 })
  likesCount: number;

  @Prop({ default: 0 })
  commentsCount: number;

  @Prop({ default: 0 })
  bookmarksCount: number;

  @Prop({ default: 0 })
  repostsCount: number;

  @Prop({ default: 'public', enum: ['public', 'followers', 'private'] })
  visibility: string;
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.index({ author: 1, createdAt: -1 });
PostSchema.index({ createdAt: -1 });
