import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private clientUrl: string;
  private from: string | undefined;

  constructor(private readonly config: ConfigService) {
    this.clientUrl = this.config.get<string>('CLIENT_URL') || 'http://localhost:3000';
    this.from = this.config.get<string>('SMTP_FROM');

    const smtpHost = this.config.get<string>('SMTP_HOST');
    const smtpPort = parseInt(this.config.get<string>('SMTP_PORT') || '587', 10);
    const smtpUser = this.config.get<string>('SMTP_USER');
    const smtpPass = this.config.get<string>('SMTP_PASS');

    console.log('📧 SMTP Config:', {
      host: smtpHost,
      port: smtpPort,
      user: smtpUser,
      pass: smtpPass,
      from: this.from,
    });

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }

  async sendEmailVerification(email: string, token: string) {
    const verificationUrl = `${this.clientUrl}/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

    const mailOptions = {
      from: this.from,
      to: email,
      subject: 'Verify your JSGram account',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #6366f1; font-size: 32px; margin: 0;">JSGram</h1>
            <p style="color: #6b7280; font-size: 16px; margin: 5px 0;">Connect with friends</p>
          </div>

          <div style="background: #f9fafb; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; font-size: 24px; margin-bottom: 15px;">Welcome to JSGram!</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin-bottom: 25px;">
              Thank you for signing up! To complete your registration and start using JSGram, please verify your email address by clicking the button below:
            </p>

            <div style="text-align: center;">
              <a href="${verificationUrl}"
                 style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Verify Email Address
              </a>
            </div>
          </div>

          <div style="text-align: center; color: #6b7280; font-size: 14px;">
            <p style="margin: 0 0 10px 0;">If the button above doesn't work, you can copy and paste this link into your browser:</p>
            <p style="margin: 0; word-break: break-all; color: #6366f1;">${verificationUrl}</p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px;">
            <p style="margin: 0;">This email was sent to ${email} because you signed up for JSGram.</p>
            <p style="margin: 5px 0;">If you didn't sign up, you can safely ignore this email.</p>
            <p style="margin: 10px 0 0 0;">&copy; ${new Date().getFullYear()} JSGram. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending verification email:', error);
      return false;
    }
  }

  async sendPasswordReset(email: string, token: string) {
    const resetUrl = `${this.clientUrl}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

    const mailOptions = {
      from: this.from,
      to: email,
      subject: 'Reset your JSGram password',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #6366f1; font-size: 32px; margin: 0;">JSGram</h1>
            <p style="color: #6b7280; font-size: 16px; margin: 5px 0;">Connect with friends</p>
          </div>

          <div style="background: #f9fafb; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; font-size: 24px; margin-bottom: 15px;">Reset Your Password</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin-bottom: 25px;">
              We received a request to reset your password. Click the button below to create a new password:
            </p>

            <div style="text-align: center;">
              <a href="${resetUrl}"
                 style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Reset Password
              </a>
            </div>
          </div>

          <div style="text-align: center; color: #6b7280; font-size: 14px;">
            <p style="margin: 0 0 10px 0;">If the button above doesn't work, you can copy and paste this link into your browser:</p>
            <p style="margin: 0; word-break: break-all; color: #6366f1;">${resetUrl}</p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px;">
            <p style="margin: 0;">This link will expire in 1 hour.</p>
            <p style="margin: 5px 0;">If you didn't request this password reset, you can safely ignore this email.</p>
            <p style="margin: 10px 0 0 0;">&copy; ${new Date().getFullYear()} JSGram. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return false;
    }
  }

  async sendNewDeviceNotification(email: string, deviceInfo: any) {
    const mailOptions = {
      from: this.from,
      to: email,
      subject: 'New device signed into your JSGram account',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #6366f1; font-size: 32px; margin: 0;">JSGram</h1>
            <p style="color: #6b7280; font-size: 16px; margin: 5px 0;">Connect with friends</p>
          </div>

          <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #dc2626; font-size: 20px; margin-bottom: 10px;">⚠️ New Device Alert</h2>
            <p style="color: #7f1d1d; font-size: 16px; line-height: 1.5;">
              A new device has signed into your JSGram account. If this was you, you can safely ignore this email.
            </p>
          </div>

          <div style="background: #f9fafb; padding: 20px; border-radius: 8px;">
            <h3 style="color: #1f2937; font-size: 18px; margin-bottom: 15px;">Device Details:</h3>
            <div style="color: #4b5563; font-size: 14px; line-height: 1.6;">
              <p style="margin: 5px 0;"><strong>Device:</strong> ${deviceInfo.deviceName}</p>
              <p style="margin: 5px 0;"><strong>Type:</strong> ${deviceInfo.deviceType}</p>
              <p style="margin: 5px 0;"><strong>Platform:</strong> ${deviceInfo.platform}</p>
              <p style="margin: 5px 0;"><strong>Browser:</strong> ${deviceInfo.browser}</p>
              <p style="margin: 5px 0;"><strong>IP Address:</strong> ${deviceInfo.ipAddress}</p>
              <p style="margin: 5px 0;"><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
          </div>

          <div style="margin-top: 20px; text-align: center;">
            <a href="${this.clientUrl}/settings/security"
               style="display: inline-block; background: #6b7280; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 14px;">
              Manage Your Devices
            </a>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px;">
            <p style="margin: 0;">If this wasn't you, please secure your account immediately.</p>
            <p style="margin: 10px 0 0 0;">&copy; ${new Date().getFullYear()} JSGram. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending new device notification:', error);
      return false;
    }
  }
}
