import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DeviceDocument = Device & Document;

@Schema({ _id: false })
export class DeviceLocation {
  @Prop({ trim: true })
  country?: string;

  @Prop({ trim: true })
  city?: string;

  @Prop({ trim: true })
  timezone?: string;
}

export const DeviceLocationSchema = SchemaFactory.createForClass(DeviceLocation);

@Schema({ timestamps: true })
export class Device {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  deviceName: string;

  @Prop({ required: true, trim: true })
  deviceType: string; // mobile, desktop, tablet

  @Prop({ required: true, trim: true })
  platform: string; // iOS, Android, Windows, macOS, Linux

  @Prop({ required: true, trim: true })
  browser: string; // Chrome, Safari, Firefox, etc.

  @Prop({ required: true, trim: true })
  userAgent: string;

  @Prop({ required: true, trim: true })
  ipAddress: string;

  @Prop({ required: true })
  isTrusted: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: Date.now })
  lastUsedAt: Date;

  @Prop({ default: null })
  refreshTokenHash?: string;

  @Prop({ type: DeviceLocationSchema, default: null })
  location?: DeviceLocation;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);

// Indexes for better performance
DeviceSchema.index({ userId: 1, isActive: 1 });
DeviceSchema.index({ userId: 1, lastUsedAt: -1 });
DeviceSchema.index({ refreshTokenHash: 1 });

// Hide sensitive data when converting to JSON
DeviceSchema.methods.toJSON = function() {
  const deviceObject = this.toObject();
  delete deviceObject.refreshTokenHash;
  return deviceObject;
};
