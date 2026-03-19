import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HashtagService } from './hashtag.service';

@Controller('hashtags')
@UseGuards(JwtAuthGuard)
export class HashtagController {
  constructor(private readonly hashtagService: HashtagService) {}

  @Get('trending')
  getTrending(@Query('limit') limit?: number) {
    return this.hashtagService.getTrending(limit);
  }

  @Get('search')
  search(@Query('q') q: string, @Query('limit') limit?: number) {
    return this.hashtagService.search(q, limit);
  }
}
