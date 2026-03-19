import { Controller, Post, Get, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { BlockService } from './block.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/utils/jwt.util';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class BlockController {
  constructor(private readonly blockService: BlockService) {}

  @Post(':id/block')
  @HttpCode(HttpStatus.OK)
  toggle(@Param('id') targetId: string, @CurrentUser() user: JwtPayload) {
    return this.blockService.toggle(user.userId, targetId);
  }

  @Get('blocked/list')
  getBlockedList(@CurrentUser() user: JwtPayload) {
    return this.blockService.getBlockedList(user.userId);
  }
}
