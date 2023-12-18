import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserEntityPg } from '../users/entities/pg/user.entity';
import { UserEntitySql } from '../users/entities/mysql/user.entity';
import { PostEntity } from '../posts/entities/post.entity';
import LocalFile from '../localFiles/entities/localFile.entity';
import { PaymentEntityPg } from '../payments/entities/payment.entity';
import { PaymentEntityMySQL } from '../payments/entities/mysql/payment.entity';

/*
@TODO Add auto import entities
 */

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST'),
        port: configService.get('POSTGRES_PORT'),
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DB'),
        entities: [UserEntityPg, PostEntity, LocalFile, PaymentEntityPg],
        synchronize: true,
        ssl:
          configService.get('NODE_ENV') === 'production'
            ? { rejectUnauthorized: false }
            : false,
      }),
    }),
    TypeOrmModule.forRootAsync({
      name: 'mysqlConnection',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('PMA_HOST'),
        port: configService.get('MYSQL_PORT'),
        username: configService.get('MYSQL_USER'),
        password: configService.get('MYSQL_PASSWORD'),
        database: configService.get('MYSQL_DATABASE'),
        entities: [UserEntitySql, PaymentEntityMySQL],
        synchronize: false,
        ssl: false,
      }),
    }),
  ],
})
export class DatabaseModule {}

function baseFolder(): string {
  const regex = /database/gi;
  return __dirname.replace(regex, '');
}
