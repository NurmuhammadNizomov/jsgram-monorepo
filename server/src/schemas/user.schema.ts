import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @ApiProperty({ example: 'john_doe', description: 'Unique username' })
  @Prop({ required: true, unique: true, trim: true, minlength: 3, maxlength: 30 })
  username: string;

  @ApiProperty({ example: 'john@example.com', description: 'User email address' })
  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  email: string;

  @ApiProperty({ example: 'John123!@#', description: 'User password (hashed)' })
  @Prop({ required: true, minlength: 6 })
  password: string;

  @ApiProperty({ example: 'John', description: 'User first name' })
  @Prop({ required: true, trim: true })
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'User last name' })
  @Prop({ required: true, trim: true })
  lastName: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', description: 'Profile avatar URL' })
  @Prop({ default: null })
  avatar?: string;

  @ApiProperty({ example: 'I love coding!', description: 'User bio' })
  @Prop({ maxlength: 500, default: null })
  bio?: string;

  @ApiProperty({ example: true, description: 'Account activation status' })
  @Prop({ default: true })
  isActive: boolean;

  @ApiProperty({ example: false, description: 'Email verification status' })
  @Prop({ default: false })
  isEmailVerified: boolean;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z', description: 'Last login timestamp' })
  @Prop({ default: null })
  lastLogin?: Date;

  @ApiProperty({ example: ['user'], description: 'User roles' })
  @Prop({ type: [String], default: ['user'] })
  roles: string[];

  @ApiProperty({ example: 'en', description: 'Preferred language' })
  @Prop({ default: 'en', enum: ['en', 'uz', 'ru'] })
  language: string;

  // Virtual fields
  @Prop({ default: null })
  passwordResetToken?: string;

  @Prop({ default: null })
  passwordResetExpires?: Date;

  @Prop({ default: null })
  emailVerificationToken?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes for better performance (email and username are already indexed via unique: true)
UserSchema.index({ createdAt: -1 });

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
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

// Pre-save middleware for password hashing (will be implemented in service)
UserSchema.pre('save', async function(next: any) {
  if (!this.isModified('password')) return next();
  // Password hashing will be handled in service
  next();
});
