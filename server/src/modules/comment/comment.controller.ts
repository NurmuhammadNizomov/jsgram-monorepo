import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/utils/jwt.util';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  // Add comment to post
  @Post('posts/:postId/comments')
  create(
    @Param('postId') postId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentService.create(postId, user.userId, dto);
  }

  // Get post comments (top-level)
  @Get('posts/:postId/comments')
  getByPost(
    @Param('postId') postId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.commentService.getByPost(postId, page, limit);
  }

  // Get replies to a comment
  @Get('comments/:commentId/replies')
  getReplies(
    @Param('commentId') commentId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.commentService.getReplies(commentId, page, limit);
  }

  // Delete comment
  @Delete('comments/:commentId')
  delete(@Param('commentId') commentId: string, @CurrentUser() user: JwtPayload) {
    return this.commentService.delete(commentId, user.userId);
  }
}
