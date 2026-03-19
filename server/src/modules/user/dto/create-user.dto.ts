import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'validation.string' })
  @MinLength(3, { message: 'validation.username_min_3' })
  @MaxLength(30, { message: 'validation.username_max_30' })
  username: string;

  @IsEmail({}, { message: 'validation.email_invalid' })
  email: string;

  @IsString({ message: 'validation.string' })
  @MinLength(6, { message: 'validation.password_min_6' })
  password: string;

  @IsString({ message: 'validation.string' })
  @MinLength(1, { message: 'validation.first_name_min_1' })
  @MaxLength(50, { message: 'validation.first_name_max_50' })
  firstName: string;

  @IsString({ message: 'validation.string' })
  @MinLength(1, { message: 'validation.last_name_min_1' })
  @MaxLength(50, { message: 'validation.last_name_max_50' })
  lastName: string;

  @IsOptional()
  @IsString({ message: 'validation.string' })
  @MaxLength(500, { message: 'validation.bio_max_500' })
  bio?: string;

  @IsOptional()
  @IsString({ message: 'validation.string' })
  avatar?: string;
}
