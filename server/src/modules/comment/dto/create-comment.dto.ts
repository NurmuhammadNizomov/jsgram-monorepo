import { IsString, IsNotEmpty, MaxLength, IsOptional, IsMongoId } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  text: string;

  @IsMongoId()
  @IsOptional()
  parentComment?: string;
}
