import { IsNumber, IsString, Min } from 'class-validator';
import Payment from '../payment.enum';

export class CreatePaymentDto {
  @IsString()
  login: string;

  @IsNumber()
  @Min(1)
  amount: number;

  @IsNumber()
  bonus?: number;

  payment: Payment;
}
