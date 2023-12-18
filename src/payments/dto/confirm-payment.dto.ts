import Payment from '../payment.enum';
import { IsString } from 'class-validator';

export class ConfirmPaymentDto {
  @IsString()
  transaction_id: string;

  payment: Payment;
}
