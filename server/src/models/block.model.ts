import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BlockDocument = Block & Document;

@Schema({ timestamps: true })
export class Block {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  blocker: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  blocked: Types.ObjectId;
}

export const BlockSchema = SchemaFactory.createForClass(Block);
BlockSchema.index({ blocker: 1, blocked: 1 }, { unique: true });
BlockSchema.index({ blocker: 1 });
BlockSchema.index({ blocked: 1 });
