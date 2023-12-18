import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import Payment from '../../payment.enum';
import { Expose } from 'class-transformer';
import { PaymentStatus } from '../../payment-status.enum';

@Entity('donations')
export class PaymentEntityMySQL {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ type: 'timestamp' })
  @Expose()
  date: Date;

  @Column()
  account: string;

  @Column()
  amount: number;

  @Column({
    type: 'enum',
    enum: Payment,
  })
  platform: Payment;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.Created,
  })
  status: PaymentStatus;

  @Column()
  transaction_id: string;

  // @ManyToOne(() => UserEntitySql, (user: UserEntitySql) => user.donations)
  // user: UserEntitySql;
  //
  // @RelationId((donation: PaymentEntityMySQL) => donation.user)
  // account_id: number;
}
