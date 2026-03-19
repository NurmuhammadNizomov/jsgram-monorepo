import { Controller, Post, Get, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/utils/jwt.util';
import { CreateConversationDto } from './dto/chat.dto';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

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
