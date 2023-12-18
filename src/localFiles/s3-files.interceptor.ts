import { FileInterceptor } from '@nestjs/platform-express';
import { Injectable, mixin, NestInterceptor, Type } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { S3Client, S3ClientConfig } from '@aws-sdk/client-s3';
//for dev 1
//import * as multerS3 from 'multer-s3';
//for prod
import multerS3 from 'multer-s3';

interface S3FilesInterceptorOptions {
  fieldName: string;
  fileFilter?: MulterOptions['fileFilter'];
  limits?: MulterOptions['limits'];
}

function S3FilesInterceptor(
  options: S3FilesInterceptorOptions,
): Type<NestInterceptor> {
  @Injectable()
  class Interceptor implements NestInterceptor {
    fileInterceptor: NestInterceptor;
    constructor(configService: ConfigService) {
      const s3 = new S3Client(<S3ClientConfig>{
        credentials: {
          accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
          secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
        },
        region: configService.get('AWS_REGION'),
      });

      const multerOptions: MulterOptions = {
        storage: multerS3({
          s3,
          bucket: configService.get('AWS_S3_BUCKET_NAME'),
          contentType: multerS3.AUTO_CONTENT_TYPE,
          acl: 'public-read',
          metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
          },
          key: (req, file, cb) => {
            cb(null, `${Date.now().toString()}-${file.originalname}`);
          },
        }),
        fileFilter: options.fileFilter,
        limits: options.limits,
      };

      this.fileInterceptor = new (FileInterceptor(
        options.fieldName,
        multerOptions,
      ))();
    }

    intercept(...args: Parameters<NestInterceptor['intercept']>) {
      return this.fileInterceptor.intercept(...args);
    }
  }
  return mixin(Interceptor);
}

export default S3FilesInterceptor;
