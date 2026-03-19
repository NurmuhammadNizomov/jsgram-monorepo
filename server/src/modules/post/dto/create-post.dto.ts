import { IsString, IsOptional, IsArray, MaxLength, IsIn } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  content?: string;

  @IsArray()
  @IsOptional()
  images?: { url: string; publicId: string }[];

  @IsString()
  @IsOptional()
  @IsIn(['public', 'followers', 'private'])
  visibility?: string;
}
