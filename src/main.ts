import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
//for dev 1
//import * as cookieParser from 'cookie-parser';
// for prod
import cookieParser from 'cookie-parser';
import { ExcludeNullInterceptor } from './utils/excludeNull.interceptor';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new ExcludeNullInterceptor());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const configService = app.get(ConfigService);

  app.use(json({ limit: '50mb' }));

  app.use(cookieParser());

  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/public/',
  });
  app.useStaticAssets(join(__dirname, '..', 'uploadedFiles'), {
    prefix: '/uploadedFiles/',
  });
  app.useStaticAssets(join(__dirname, '..', 'tmp'), {
    prefix: '/tmp/',
  });

  app.enableCors({
    origin: [configService.get('FRONTEND_URL'), 'http://localhost:3000'],
    credentials: true,
    //methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    // preflightContinue: false,
    // optionsSuccessStatus: 204,
    // origin: [
    //   'https://l2srv.vercel.app',
    //   'http://localhost:3000',
    //   'https://l2srv.vercel.app/',
    //   '*',
    // ],
    // allowedHeaders: [
    //   'Origin',
    //   'X-Requested-With',
    //   'Content-Type',
    //   'Accept',
    //   'Authorization',
    //   'authorization',
    //   'X-Forwarded-for',
    // ],
  });

  // app.use((req, res, next) => {
  //   res.header(
  //     'Access-Control-Allow-Origin',
  //     'https://l2srv.vercel.app',
  //     'https://l2-backend.vercel.app',
  //     'http://localhost:3000/',
  //   );
  //   res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  //   res.header(
  //     'Access-Control-Allow-Headers',
  //     'Content-Type, Accept,Origin,Authorization',
  //   );
  //   next();
  // });

  const port = configService.get('PORT') ?? 7777;

  await app.listen(port);
}
bootstrap();
