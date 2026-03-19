import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Block, BlockSchema } from '../../models/block.model';
import { Follow, FollowSchema } from '../../models/follow.model';
import { BlockService } from './block.service';
import { BlockController } from './block.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Block.name, schema: BlockSchema },
      { name: Follow.name, schema: FollowSchema },
    ]),
  ],
  controllers: [BlockController],
  providers: [BlockService],
  exports: [BlockService],
})
export class BlockModule {}
