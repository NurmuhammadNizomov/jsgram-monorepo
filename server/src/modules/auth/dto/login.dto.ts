import { IsEmail, IsString, IsOptional, IsBoolean, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Email address',
    example: 'user@example.com'
  })
  @IsEmail({}, { message: 'validation.email_invalid' })
  email: string;

  @ApiProperty({
    description: 'Password',
    example: 'password123'
  })
  @IsString({ message: 'validation.string' })
  password: string;

  @ApiPropertyOptional({
    description: 'Remember me on this device',
    example: false,
    default: false
  })
  @IsOptional()
  @IsBoolean({ message: 'validation.boolean' })
  rememberMe?: boolean;
}

export class VerifyEmailDto {
  @ApiProperty({
    description: 'Email verification token',
    example: 'a1b2c3d4e5f6...'
  })
  @IsString({ message: 'validation.string' })
  token: string;
}

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Email address',
    example: 'user@example.com'
  })
  @IsEmail({}, { message: 'validation.email_invalid' })
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Password reset token',
    example: 'a1b2c3d4e5f6...'
  })
  @IsString({ message: 'validation.string' })
  token: string;

  @ApiProperty({
    description: 'New password (min 6 characters)',
    example: 'newpassword123'
  })
  @IsString({ message: 'validation.string' })
  @MinLength(6, { message: 'validation.password_min_6' })
  password: string;
}
