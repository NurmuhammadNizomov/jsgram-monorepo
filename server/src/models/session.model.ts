import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SessionDocument = Session & Document;

@Schema({ timestamps: true })
export class Session {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Device' })
  deviceId: Types.ObjectId;

  @Prop({ required: true, unique: true, trim: true })
  sessionId: string;

  @Prop({ required: true, trim: true })
  accessToken: string;

  @Prop({ required: true, trim: true })
  refreshToken: string;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ required: true, default: true })
  isActive: boolean;

  @Prop({ required: true, trim: true })
  ipAddress: string;

  @Prop({ required: true, trim: true })
  userAgent: string;

  @Prop({ default: null })
  lastActivityAt?: Date;

  @Prop({ default: false })
  isRemembered: boolean;
}

export const SessionSchema = SchemaFactory.createForClass(Session);

// Indexes for better performance
SessionSchema.index({ userId: 1, isActive: 1 });
SessionSchema.index({ deviceId: 1, isActive: 1 });
SessionSchema.index({ refreshToken: 1 });
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired sessions

// Hide sensitive data when converting to JSON
SessionSchema.methods.toJSON = function() {
  const sessionObject = this.toObject();
  delete sessionObject.accessToken;
  delete sessionObject.refreshToken;
  return sessionObject;
};
