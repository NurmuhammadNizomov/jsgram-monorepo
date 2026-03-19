import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from '../../models/post.model';
import { Like, LikeSchema } from '../../models/like.model';
import { Bookmark, BookmarkSchema } from '../../models/bookmark.model';
import { Follow, FollowSchema } from '../../models/follow.model';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { UploadModule } from '../upload/upload.module';
import { NotificationModule } from '../notification/notification.module';
import { HashtagModule } from '../hashtag/hashtag.module';
import { BlockModule } from '../block/block.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Like.name, schema: LikeSchema },
      { name: Bookmark.name, schema: BookmarkSchema },
      { name: Follow.name, schema: FollowSchema },
    ]),
    UploadModule,
    NotificationModule,
    HashtagModule,
    BlockModule,
  ],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}
