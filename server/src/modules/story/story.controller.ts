import {
  Controller, Get, Post, Delete, Param, Body,
  UseGuards, UseInterceptors, UploadedFile,
  ParseFilePipe, MaxFileSizeValidator, FileTypeValidator,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/utils/jwt.util';
import { StoryService } from './story.service';

@Controller('stories')
@UseGuards(JwtAuthGuard)
export class StoryController {
  constructor(private readonly storyService: StoryService) {}

  @Get('feed')
  getFeed(@CurrentUser() user: JwtPayload) {
    return this.storyService.getFeedStories(user.userId);
  }

  @Get('mine')
  getMine(@CurrentUser() user: JwtPayload) {
    return this.storyService.getMyStories(user.userId);
  }

  @Get('user/:userId')
  getByUser(@Param('userId') userId: string, @CurrentUser() viewer: JwtPayload) {
    return this.storyService.getByUser(userId, viewer.userId);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  create(
    @CurrentUser() user: JwtPayload,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 100 * 1024 * 1024 }), // 100 MB for videos
          new FileTypeValidator({ fileType: /^(image\/(jpeg|png|gif|webp)|video\/(mp4|mov|avi|webm|quicktime))$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body('caption') caption?: string,
  ) {
    return this.storyService.create(user.userId, file, caption);
  }

  @Post(':id/view')
  @HttpCode(HttpStatus.OK)
  markViewed(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.storyService.markViewed(id, user.userId);
  }

  @Post(':id/like')
  @HttpCode(HttpStatus.OK)
  toggleLike(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.storyService.toggleLike(id, user.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.storyService.delete(id, user.userId);
  }
}
