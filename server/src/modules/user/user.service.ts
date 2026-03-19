import {
  Injectable, NotFoundException, ConflictException,
  BadRequestException, UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../../models/user.model';
import { Follow, FollowDocument } from '../../models/follow.model';
import { UpdateUserDto } from './dto/update-user.dto';
import { UploadService } from '../upload/upload.service';
import { BlockService } from '../block/block.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Follow.name) private followModel: Model<FollowDocument>,
    private readonly uploadService: UploadService,
    private readonly blockService: BlockService,
  ) {}

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).select('-password -passwordResetToken -emailVerificationToken');
    if (!user) throw new NotFoundException('user.not_found');
    return user;
  }

  async findByIdentifier(identifier: string, viewerId: string) {
    const isId = /^[a-f\d]{24}$/i.test(identifier);
    const user = await this.userModel
      .findOne(isId ? { _id: identifier } : { username: identifier })
      .select('-password -passwordResetToken -emailVerificationToken')
      .lean();
    if (!user) throw new NotFoundException('user.not_found');

    const [followersCount, followingCount, isFollowing] = await Promise.all([
      this.followModel.countDocuments({ following: user._id }),
      this.followModel.countDocuments({ follower: user._id }),
      this.followModel.exists({ follower: viewerId, following: user._id }),
    ]);

    return { ...user, followersCount, followingCount, isFollowing: !!isFollowing };
  }

  async updateProfile(userId: string, dto: UpdateUserDto): Promise<UserDocument> {
    const forbidden = ['password', 'email', 'roles', 'isActive', 'isEmailVerified'] as const;
    for (const key of forbidden) {
      if (key in dto) throw new BadRequestException(`Cannot update ${key} via this endpoint`);
    }

    if (dto.username) {
      const exists = await this.userModel.findOne({ username: dto.username, _id: { $ne: userId } });
      if (exists) throw new ConflictException('auth.username_exists');
    }

    const user = await this.userModel.findByIdAndUpdate(userId, dto, { new: true, runValidators: true })
      .select('-password -passwordResetToken -emailVerificationToken');
    if (!user) throw new NotFoundException('user.not_found');
    return user;
  }

  async updateAvatar(userId: string, file: Express.Multer.File) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('user.not_found');

    // Delete old avatar from cloudinary
    if (user.avatar && (user as any).avatarPublicId) {
      await this.uploadService.deleteImage((user as any).avatarPublicId).catch(() => null);
    }

    const result = await this.uploadService.uploadImage(file, 'jsgram/avatars');
    user.avatar = result.secure_url;
    (user as any).avatarPublicId = result.public_id;
    await user.save();

    return { avatar: user.avatar };
  }

  async changePasswordSecure(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('user.not_found');

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw new UnauthorizedException('auth.invalid_credentials');

    if (newPassword.length < 6) throw new BadRequestException('validation.password_min_6');

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
    return { message: 'auth.password_changed' };
  }

  async deactivate(userId: string) {
    await this.userModel.findByIdAndUpdate(userId, { isActive: false });
    return { message: 'user.deactivated' };
  }

  async search(q: string, viewerId: string, page = 1, limit = 20) {
    if (!q?.trim()) return [];
    const skip = (page - 1) * limit;
    const regex = new RegExp(q.trim(), 'i');
    const excludeIds = await this.blockService.getMutualBlockIds(viewerId);

    const users = await this.userModel
      .find({
        isActive: true,
        _id: { $ne: viewerId, $nin: excludeIds },
        $or: [{ username: regex }, { firstName: regex }, { lastName: regex }],
      })
      .select('username firstName lastName avatar bio isOnline')
      .sort({ username: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return this._attachFollowing(users, viewerId);
  }

  async getSuggested(viewerId: string, limit = 10) {
    const [following, excludeIds] = await Promise.all([
      this.followModel.find({ follower: viewerId }).select('following').lean(),
      this.blockService.getMutualBlockIds(viewerId),
    ]);
    const followingIds = following.map((f) => f.following.toString());

    const users = await this.userModel
      .find({ isActive: true, _id: { $ne: viewerId, $nin: [...followingIds, ...excludeIds.map(id => id.toString())] } })
      .select('username firstName lastName avatar bio isOnline')
      .limit(limit)
      .lean();

    return this._attachFollowing(users, viewerId);
  }

  private async _attachFollowing(users: any[], viewerId: string) {
    if (!users.length) return [];
    const ids = users.map((u) => u._id);
    const follows = await this.followModel
      .find({ follower: viewerId, following: { $in: ids } })
      .select('following')
      .lean();
    const followingSet = new Set(follows.map((f) => f.following.toString()));
    return users.map((u) => ({ ...u, isFollowing: followingSet.has(u._id.toString()) }));
  }

  // Legacy methods kept for auth module compatibility
  async findByEmail(email: string) { return this.userModel.findOne({ email }); }
  async findOne(id: string) { return this.findById(id); }
  async findAll() { return this.userModel.find({ isActive: true }).select('-password').sort({ createdAt: -1 }); }
  async changePassword(id: string, hash: string) { await this.userModel.findByIdAndUpdate(id, { password: hash }); }
}
