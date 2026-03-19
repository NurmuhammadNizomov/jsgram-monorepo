import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/utils/jwt.util';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';

@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostController {
  constructor(private readonly postService: PostService) {}

  // Create post
  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreatePostDto) {
    return this.postService.create(user.userId, dto);
  }

  // Feed (following + own posts)
  @Get('feed')
  getFeed(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.postService.getFeed(user.userId, page, limit);
  }

  // Explore (public posts sorted by likes)
  @Get('explore')
  getExplorePosts(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.postService.getExplorePosts(user.userId, page, limit);
  }

  // Get bookmarks
  @Get('bookmarks')
  getBookmarks(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.postService.getBookmarks(user.userId, page, limit);
  }

  // Get user posts
  @Get('user/:userId')
  getUserPosts(
    @Param('userId') userId: string,
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.postService.getUserPosts(userId, user.userId, page, limit);
  }

  // Get single post
  @Get(':id')
  getById(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.postService.getById(id, user.userId);
  }

  // Edit post content
  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body('content') content: string,
  ) {
    return this.postService.update(id, user.userId, content);
  }

  // Delete post
  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.postService.delete(id, user.userId);
  }

  // Like / Unlike
  @Post(':id/like')
  toggleLike(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.postService.toggleLike(id, user.userId);
  }

  // Bookmark / Unbookmark
  @Post(':id/bookmark')
  toggleBookmark(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.postService.toggleBookmark(id, user.userId);
  }
}
