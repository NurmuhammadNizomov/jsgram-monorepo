import { IsString, IsNotEmpty, MaxLength, IsMongoId } from 'class-validator';

export class SendMessageDto {
  @IsMongoId()
  conversationId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  text: string;
}

export class CreateConversationDto {
  @IsMongoId()
  participantId: string;
}
