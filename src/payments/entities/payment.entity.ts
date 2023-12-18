import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import Payment from '../payment.enum';
import { Expose } from 'class-transformer';
import { PaymentStatus } from '../payment-status.enum';

@Entity('payments')
export class PaymentEntityPg {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  amount: number;

  @Column({ nullable: true })
  bonus: number;

  @Column()
  total: number;

  @Column({ nullable: true })
  transaction_id: string;

  @Column({
    type: 'enum',
    enum: Payment,
  })
  payment: Payment;

  @Column({ nullable: true })
  payment_link: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.Created,
  })
  status: PaymentStatus;

  @Column()
  login: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  user_id: number;

  @CreateDateColumn({ type: 'timestamp' })
  @Expose()
  registeredAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  @Expose()
  updatedAt: Date;
}
