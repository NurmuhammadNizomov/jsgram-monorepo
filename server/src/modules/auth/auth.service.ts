import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';
import { User, UserDocument } from '../../models/user.model';
import { Device, DeviceDocument } from '../../models/device.model';
import { Session, SessionDocument } from '../../models/session.model';
import { JwtUtil, TokenPair } from '../../common/utils/jwt.util';
import { DeviceUtil } from '../../common/utils/device.util';
import { EmailService } from '../../common/services/email.service';
import { getRequestLang } from '../../common/i18n/i18n';
import { RegisterDto } from './dto/register.dto';
import { LoginDto, RefreshTokenDto, VerifyEmailDto, ForgotPasswordDto, ResetPasswordDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    private emailService: EmailService,
  ) {}

  private normalizeUsernameBase(value: string): string {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '');
    return cleaned.length > 0 ? cleaned.slice(0, 20) : 'user';
  }

  private async generateUniqueUsername(base: string): Promise<string> {
    const normalizedBase = this.normalizeUsernameBase(base);

    // Try base first, then base_1234...
    for (let attempt = 0; attempt < 20; attempt++) {
      const suffix = attempt === 0 ? '' : `_${Math.floor(1000 + Math.random() * 9000)}`;
      const candidate = `${normalizedBase}${suffix}`.slice(0, 30);
      const exists = await this.userModel.exists({ username: candidate });
      if (!exists) return candidate;
    }

    // Fallback, extremely unlikely to collide
    return `${normalizedBase}_${Date.now().toString().slice(-6)}`.slice(0, 30);
  }

  async register(registerDto: RegisterDto, req: Request): Promise<{ message: string; user: any }> {
    const { email, password } = registerDto;
    const bio = registerDto.bio;
    const language = registerDto.language ?? getRequestLang(req);
    const firstName = registerDto.firstName ?? '';
    const lastName = registerDto.lastName ?? '';
    const username = registerDto.username
      ? registerDto.username
      : await this.generateUniqueUsername(email.split('@')[0] ?? 'user');

    // Check if user already exists
    const existingUser = await this.userModel.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new BadRequestException('auth.email_exists');
      }
      if (existingUser.username === username) {
        throw new BadRequestException('auth.username_exists');
      }
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate email verification token
    const emailVerificationToken = JwtUtil.generateEmailVerificationToken();

    // Create user
    const user = new this.userModel({
      email,
      username,
      password: hashedPassword,
      firstName,
      lastName,
      bio,
      language: language || 'en',
      emailVerificationToken,
      isEmailVerified: false,
    });

    await user.save();

    // Send verification email
    console.log('🔐 Auth Service: Attempting to send verification email to:', email);
    console.log('🔐 Auth Service: Verification token:', emailVerificationToken);
    
    const emailSent = await this.emailService.sendEmailVerification(email, emailVerificationToken);
    
    if (emailSent) {
      console.log('🔐 Auth Service: Verification email sent successfully');
    } else {
      console.error('🔐 Auth Service: Failed to send verification email');
    }

    // Return user without sensitive data
    const { password: _, ...userWithoutPassword } = user.toJSON();

    return {
      message: 'auth.register_success',
      user: userWithoutPassword
    };
  }

  async login(loginDto: LoginDto, req: Request): Promise<{ tokens: TokenPair; user: any; isNewDevice: boolean }> {
    const { email, password, rememberMe = false } = loginDto;

    // Find user
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('auth.invalid_credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('auth.invalid_credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('auth.account_deactivated');
    }

    // Extract device info
    const deviceInfo = DeviceUtil.extractDeviceInfo(req);

    // Find or create device
    let device = await this.deviceModel.findOne({
      userId: user._id,
      userAgent: deviceInfo.userAgent,
      ipAddress: deviceInfo.ipAddress
    });

    let isNewDevice = false;

    if (!device) {
      // Check if user has any trusted devices
      const userDevices = await this.deviceModel.find({ userId: user._id });
      const isTrusted = userDevices.length === 0; // First device is automatically trusted
      
      device = new this.deviceModel({
        userId: user._id,
        ...deviceInfo,
        isTrusted,
        isActive: true,
        lastUsedAt: new Date()
      });

      await device.save();
      isNewDevice = true;

      // Send new device notification if not first device
      if (userDevices.length > 0) {
        await this.emailService.sendNewDeviceNotification(user.email, deviceInfo);
      }
    } else {
      // Update last used time
      device.lastUsedAt = new Date();
      device.isActive = true;
      await device.save();
    }

    // Generate tokens
    const tokens = JwtUtil.generateTokenPair(user._id.toString(), device._id.toString());

    // Create session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    const session = new this.sessionModel({
      userId: user._id,
      deviceId: device._id,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt,
      ipAddress: deviceInfo.ipAddress,
      userAgent: deviceInfo.userAgent,
      isRemembered: rememberMe
    });

    await session.save();

    // Update user's devices array
    if (!user.devices.includes(device._id)) {
      user.devices.push(device._id);
      await user.save();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Return user without sensitive data
    const { password: _, ...userWithoutPassword } = user.toJSON();

    return {
      tokens,
      user: userWithoutPassword,
      isNewDevice
    };
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<{ message: string }> {
    const { token } = verifyEmailDto;

    // Find user with verification token
    const user = await this.userModel.findOne({ emailVerificationToken: token });
    if (!user) {
      throw new BadRequestException('auth.verify_token_invalid');
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    return {
      message: 'auth.email_verified'
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto, req: Request): Promise<{ accessToken: string }> {
    const { refreshToken } = refreshTokenDto;

    // Verify refresh token
    const payload = JwtUtil.verifyRefreshToken(refreshToken);

    // Find session
    const session = await this.sessionModel.findOne({
      refreshToken,
      isActive: true,
      expiresAt: { $gt: new Date() }
    }).populate('userId');

    if (!session) {
      throw new UnauthorizedException('auth.refresh_token_invalid');
    }

    // Generate new access token
    const newAccessToken = JwtUtil.refreshAccessToken(refreshToken);

    // Update session with new access token
    session.accessToken = newAccessToken;
    session.lastActivityAt = new Date();
    await session.save();

    return { accessToken: newAccessToken };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;

    // Find user
    const user = await this.userModel.findOne({ email });
    if (!user) {
      // Don't reveal that user doesn't exist
      return { message: 'auth.forgot_password_sent' };
    }

    // Generate reset token
    const resetToken = JwtUtil.generatePasswordResetToken();
    const resetTokenHash = JwtUtil.hashToken(resetToken);
    const resetTokenExpires = new Date();
    resetTokenExpires.setHours(resetTokenExpires.getHours() + 1); // 1 hour expiry

    // Update user
    user.passwordResetToken = resetTokenHash;
    user.passwordResetExpires = resetTokenExpires;
    await user.save();

    // Send reset email
    console.log('🔐 Auth Service: Attempting to send password reset email to:', email);
    console.log('🔐 Auth Service: Reset token:', resetToken);
    
    const emailSent = await this.emailService.sendPasswordReset(email, resetToken);
    
    if (emailSent) {
      console.log('🔐 Auth Service: Password reset email sent successfully');
    } else {
      console.error('🔐 Auth Service: Failed to send password reset email');
    }

    return {
      message: 'auth.forgot_password_sent'
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const { token, password } = resetPasswordDto;

    // Hash token and find user
    const tokenHash = JwtUtil.hashToken(token);
    const user = await this.userModel.findOne({
      passwordResetToken: tokenHash,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      throw new BadRequestException('auth.reset_token_invalid');
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update user
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Deactivate all sessions for this user (force logout on all devices)
    await this.sessionModel.updateMany(
      { userId: user._id },
      { isActive: false }
    );

    return {
      message: 'auth.password_reset_success'
    };
  }

  async logout(sessionId: string): Promise<{ message: string }> {
    await this.sessionModel.updateOne({ sessionId }, { isActive: false });
    return { message: 'auth.logout_success' };
  }

  async logoutAllDevices(userId: string): Promise<{ message: string }> {
    // Deactivate all sessions for this user
    await this.sessionModel.updateMany(
      { userId, isActive: true },
      { isActive: false }
    );

    return { message: 'auth.logout_all_success' };
  }

  async getUserDevices(userId: string): Promise<any[]> {
    const devices = await this.deviceModel
      .find({ userId, isActive: true })
      .sort({ lastUsedAt: -1 });

    return devices;
  }

  async removeDevice(userId: string, deviceId: string): Promise<{ message: string }> {
    // Deactivate device
    await this.deviceModel.updateOne(
      { _id: deviceId, userId },
      { isActive: false }
    );

    // Deactivate all sessions for this device
    await this.sessionModel.updateMany(
      { deviceId, isActive: true },
      { isActive: false }
    );

    return { message: 'auth.device_removed' };
  }
}
