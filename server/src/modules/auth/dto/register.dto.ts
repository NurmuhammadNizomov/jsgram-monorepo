import { IsEmail, IsString, MinLength, Matches, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com'
  })
  @IsEmail({}, { message: 'validation.email_invalid' })
  email: string;

  @ApiProperty({
    description: 'Password (min 6 characters)',
    example: 'password123',
    minLength: 6
  })
  @IsString({ message: 'validation.string' })
  @MinLength(6, { message: 'validation.password_min_6' })
  password: string;

  @ApiPropertyOptional({
    description: 'Username (3-30 characters). Optional, generated if omitted.',
    example: 'johndoe',
    minLength: 3,
    maxLength: 30
  })
  @IsOptional()
  @IsString({ message: 'validation.string' })
  @MinLength(3, { message: 'validation.username_min_3' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'validation.username_format'
  })
  username?: string;

  @ApiPropertyOptional({
    description: 'First name (optional)',
    example: 'John'
  })
  @IsOptional()
  @IsString({ message: 'validation.string' })
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Last name (optional)',
    example: 'Doe'
  })
  @IsOptional()
  @IsString({ message: 'validation.string' })
  lastName?: string;

  @ApiPropertyOptional({
    description: 'User bio (max 500 characters)',
    example: 'Software developer and tech enthusiast',
    maxLength: 500
  })
  @IsOptional()
  @IsString({ message: 'validation.string' })
  bio?: string;

  @ApiPropertyOptional({
    description: 'Preferred language',
    example: 'en',
    enum: ['en', 'uz', 'ru']
  })
  @IsOptional()
  @IsString({ message: 'validation.string' })
  language?: 'en' | 'uz' | 'ru';
}
