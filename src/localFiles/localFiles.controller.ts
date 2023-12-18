import {
  Controller,
  Get,
  Param,
  UseInterceptors,
  ClassSerializerInterceptor,
  StreamableFile,
  Res,
  ParseIntPipe,
  UploadedFile,
  Post,
  UseGuards,
  BadRequestException,
  Req,
} from '@nestjs/common';
import LocalFilesService from './localFiles.service';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { join } from 'path';
import { CacheInterceptor } from '@nestjs/cache-manager';
import RequestWithUser from '../auth/requestWithUser.interface';
import RoleGuard from '../roles/role.guard';
import Role from '../roles/role.enum';
import S3FilesInterceptor from './s3-files.interceptor';

@Controller('local-files')
@UseInterceptors(ClassSerializerInterceptor)
export default class LocalFilesController {
  constructor(private readonly localFilesService: LocalFilesService) {}

  // @UseInterceptors(CacheInterceptor)
  // @Get(':id')
  // async getDatabaseFileById(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Res({ passthrough: true }) response: Response,
  // ) {
  //   const file = await this.localFilesService.getFileById(id);
  //
  //   const stream = createReadStream(join(process.cwd(), file.path));
  //
  //   response.set({
  //     'Content-Disposition': `inline; filename="${file.filename}"`,
  //     'Content-Type': file.mimetype,
  //   });
  //   return new StreamableFile(stream);
  // }

  // @Post('upload')
  // @UseGuards(RoleGuard(Role.Admin))
  // @UseInterceptors(
  //   S3FilesInterceptor({
  //     fieldName: 'image',
  //     fileFilter: (request, file, callback) => {
  //       if (!file.mimetype.includes('image')) {
  //         return callback(
  //           new BadRequestException('Provide a valid image'),
  //           false,
  //         );
  //       }
  //       callback(null, true);
  //     },
  //     limits: {
  //       fileSize: Math.pow(2048, 2), // 2MB
  //     },
  //   }),
  // )
  // async uploadFile(
  //   @Req() request: RequestWithUser,
  //   @UploadedFile() file: Express.MulterS3.File,
  // ) {
  //   return this.localFilesService.addAvatar(request.user.id, {
  //     path: file.path,
  //     filename: file.originalname,
  //     mimetype: file.mimetype,
  //   });
  // }
}
