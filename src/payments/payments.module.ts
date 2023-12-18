import { forwardRef, Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentEntityPg } from './entities/payment.entity';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { PaymentEntityMySQL } from './entities/mysql/payment.entity';
import { CryptoCloudService } from './api/cryptocloud.service';
import { PaypalychService } from './api/paypalych.service';
import { EnotService } from './api/enot.service';
import { PrimeService } from './api/prime.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentEntityPg]),
    TypeOrmModule.forFeature([PaymentEntityMySQL], 'mysqlConnection'),
    ConfigModule,
    forwardRef(() => UsersModule),
  ],
  controllers: [PaymentsController],
  providers: [
    CryptoCloudService,
    PaypalychService,
    EnotService,
    PrimeService,
    PaymentsService,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
