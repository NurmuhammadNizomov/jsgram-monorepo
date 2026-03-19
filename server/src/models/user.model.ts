import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Device } from './device.model';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, trim: true, minlength: 3, maxlength: 30 })
  username: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  email: string;

  @Prop({ required: true, minlength: 6 })
  password: string;

  @Prop({ trim: true, default: '' })
  firstName?: string;

  @Prop({ trim: true, default: '' })
  lastName?: string;

  @Prop({ default: null })
  avatar?: string;

  @Prop({ maxlength: 500, default: null })
  bio?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ default: null })
  lastLogin?: Date;

  @Prop({ type: [String], default: ['user'] })
  roles: string[];

  @Prop({ default: 'en', enum: ['en', 'uz', 'ru'] })
  language: string;

  @Prop({ default: null })
  passwordResetToken?: string;

  @Prop({ default: null })
  passwordResetExpires?: Date;

  @Prop({ default: null })
  emailVerificationToken?: string;

  @Prop({ type: [Types.ObjectId], ref: 'Device', default: [] })
  devices: Types.ObjectId[];

  @Prop({ default: null })
  lastSeen?: Date;

  @Prop({ default: false })
  isOnline: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes for better performance (email and username are already indexed via unique: true)
UserSchema.index({ createdAt: -1 });

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim();
});

// Hide sensitive data when converting to JSON
UserSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  delete userObject.emailVerificationToken;
  return userObject;
};
