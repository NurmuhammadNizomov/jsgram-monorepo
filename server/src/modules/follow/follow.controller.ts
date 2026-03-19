import { Controller, Post, Delete, Get, Param, Query, UseGuards } from '@nestjs/common';
import { FollowService } from './follow.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/utils/jwt.util';

@Controller('users')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post(':id/follow')
  @UseGuards(JwtAuthGuard)
  follow(@CurrentUser() user: JwtPayload, @Param('id') targetId: string) {
    return this.followService.follow(user.userId, targetId);
  }

  @Delete(':id/follow')
  @UseGuards(JwtAuthGuard)
  unfollow(@CurrentUser() user: JwtPayload, @Param('id') targetId: string) {
    return this.followService.unfollow(user.userId, targetId);
  }

  @Get(':id/followers')
  getFollowers(
    @Param('id') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.followService.getFollowers(userId, +page, +limit);
  }

  @Get(':id/following')
  getFollowing(
    @Param('id') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.followService.getFollowing(userId, +page, +limit);
  }

  @Get(':id/follow-counts')
  getCounts(@Param('id') userId: string) {
    return this.followService.getCounts(userId);
  }
}
