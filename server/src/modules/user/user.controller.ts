import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  UseGuards, HttpStatus, HttpCode, Query, UseInterceptors,
  UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/utils/jwt.util';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // My profile
  @Get('profile')
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.userService.findById(user.userId);
  }

  // Update my profile
  @Patch('profile')
  updateProfile(@CurrentUser() user: JwtPayload, @Body() dto: UpdateUserDto) {
    return this.userService.updateProfile(user.userId, dto);
  }

  // Upload avatar
  @Post('profile/avatar')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  uploadAvatar(
    @CurrentUser() user: JwtPayload,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.userService.updateAvatar(user.userId, file);
  }

  // Change password
  @Patch('profile/password')
  changePassword(
    @CurrentUser() user: JwtPayload,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    return this.userService.changePasswordSecure(user.userId, body.currentPassword, body.newPassword);
  }

  // Deactivate account
  @Delete('profile')
  @HttpCode(HttpStatus.OK)
  deactivate(@CurrentUser() user: JwtPayload) {
    return this.userService.deactivate(user.userId);
  }

  // Search users
  @Get('search')
  search(
    @Query('q') q: string,
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.userService.search(q, user.userId, page, limit);
  }

  // Suggested users (People you may know)
  @Get('suggested')
  getSuggested(@CurrentUser() user: JwtPayload, @Query('limit') limit?: number) {
    return this.userService.getSuggested(user.userId, limit);
  }

  // Get user by username or id
  @Get(':identifier')
  findOne(@Param('identifier') identifier: string, @CurrentUser() user: JwtPayload) {
    return this.userService.findByIdentifier(identifier, user.userId);
  }
}
