import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from '@hapi/joi';
import { AuthModule } from './auth/auth.module';
import { EmailConfirmationModule } from './emailConfirmation/emailConfirmation.module';
import { PostsModule } from './posts/posts.module';
import { LocalFilesModule } from './localFiles/localFiles.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),
        NODE_ENV: Joi.string().required(),
        PORT: Joi.number(),
        FRONTEND_URL: Joi.string(),
        DOMAIN: Joi.string(),
        JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
        JWT_ACCESS_TOKEN_EXPIRATION_TIME: Joi.string().required(),
        JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
        JWT_REFRESH_TOKEN_EXPIRATION_TIME: Joi.string().required(),
        EMAIL_SERVICE: Joi.string().required(),
        EMAIL_USER: Joi.string().required(),
        EMAIL_PASSWORD: Joi.string().required(),
        JWT_VERIFICATION_TOKEN_SECRET: Joi.string().required(),
        JWT_VERIFICATION_TOKEN_EXPIRATION_TIME: Joi.string().required(),
        EMAIL_CONFIRMATION_URL: Joi.string().required(),
        JWT_RESET_PASSWORD_TOKEN_SECRET: Joi.string().required(),
        JWT_RESET_PASSWORD_TOKEN_EXPIRATION_TIME: Joi.string().required(),
        RESET_PASSWORD_URL: Joi.string().required(),
        PUBLIC_STATIC_FILE_URL: Joi.string().required(),
        UPLOADED_FILES_DESTINATION: Joi.string().required(),
        AWS_ACCESS_KEY_ID: Joi.string().required(),
        AWS_SECRET_ACCESS_KEY: Joi.string().required(),
        AWS_REGION: Joi.string().required(),
        AWS_S3_BUCKET_NAME: Joi.string().required(),
        CRYPTOCLOUD_API_URL: Joi.string().required(),
        CRYPTOCLOUD_TOKEN: Joi.string().required(),
        CRYPTOCLOUD_SHOP_ID: Joi.string().required(),
        PAYPALYCH_API_URL: Joi.string().required(),
        PAYPALYCH_TOKEN: Joi.string().required(),
        PAYPALYCH_SHOP_ID: Joi.string().required(),
        ENOT_SHOP_ID: Joi.string().required(),
        ENOT_API_URL: Joi.string().required(),
        ENOT_SECRET_KEY: Joi.string().required(),
        ENOT_MORE_KEY: Joi.string().required(),
        PRIME_API_URL: Joi.string().required(),
        PRIME_TOKEN: Joi.string().required(),
        PRIME_SHOP_ID: Joi.string().required(),
      }),
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    EmailConfirmationModule,
    PostsModule,
    LocalFilesModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
