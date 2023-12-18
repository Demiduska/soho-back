import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import LocalFilesService from './localFiles.service';
import LocalFilesController from './localFiles.controller';
import LocalFile from './entities/localFile.entity';

@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: () => ({
        ttl: 30,
        max: 100,
      }),
    }),
    TypeOrmModule.forFeature([LocalFile]),
    ConfigModule,
  ],
  providers: [LocalFilesService],
  exports: [LocalFilesService],
  controllers: [LocalFilesController],
})
export class LocalFilesModule {}
