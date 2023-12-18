import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntityPg } from './entities/pg/user.entity';
import { ConfigModule } from '@nestjs/config';
import { UserEntitySql } from './entities/mysql/user.entity';
import { EmailConfirmationModule } from '../emailConfirmation/emailConfirmation.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntityPg]),
    TypeOrmModule.forFeature([UserEntitySql], 'mysqlConnection'),
    ConfigModule,
    forwardRef(() => EmailConfirmationModule),
    AuthModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
