import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Story, StorySchema } from '../../models/story.model';
import { Follow, FollowSchema } from '../../models/follow.model';
import { StoryService } from './story.service';
import { StoryController } from './story.controller';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Story.name, schema: StorySchema },
      { name: Follow.name, schema: FollowSchema },
    ]),
    UploadModule,
  ],
  controllers: [StoryController],
  providers: [StoryService],
  exports: [StoryService],
})
export class StoryModule {}
