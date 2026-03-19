import { Controller, Post, Get, Param, Body, Query, UseGuards } from '@nestjs/common';
import { IsString, MinLength, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/utils/jwt.util';
import { CreateConversationDto } from './dto/chat.dto';

class StoryReplyDto {
  @IsString() storyId: string;
  @IsString() mediaUrl: string;
  @IsString() mediaType: string;
}

class SendDirectDto {
  @IsString() recipientId: string;
  @IsString() @MinLength(1) text: string;
  @IsOptional() @ValidateNested() @Type(() => StoryReplyDto) storyReply?: StoryReplyDto;
}

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatGateway: ChatGateway,
  ) {}

  // Get all conversations for current user
  @Get()
  getConversations(@CurrentUser() user: JwtPayload) {
    return this.chatService.getConversations(user.userId);
  }

  // Get or create 1-to-1 conversation
  @Post()
  createConversation(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateConversationDto,
  ) {
    return this.chatService.getOrCreateConversation(user.userId, dto.participantId);
  }

  // Send direct message (used from story reply, etc.) — emits via socket for real-time
  @Post('direct')
  async sendDirect(@CurrentUser() user: JwtPayload, @Body() dto: SendDirectDto) {
    const message = await this.chatService.saveMessageToUser(
      user.userId,
      dto.recipientId,
      dto.text,
      dto.storyReply,
    );
    // Emit to conversation room so both participants get it in real-time
    this.chatGateway.emitToConversation(
      message.conversationId.toString(),
      'new_message',
      message,
    );
    return message;
  }

  // Get messages
  @Get(':id/messages')
  getMessages(
    @CurrentUser() user: JwtPayload,
    @Param('id') conversationId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    return this.chatService.getMessages(conversationId, user.userId, +page, +limit);
  }
}
