import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PostEntity } from './entities/post.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { LocalFilesModule } from '../localFiles/localFiles.module';

@Module({
  imports: [
    CacheModule.register(),
    TypeOrmModule.forFeature([PostEntity]),
    ConfigModule,
    LocalFilesModule,
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
