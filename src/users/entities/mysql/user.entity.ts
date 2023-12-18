import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import Confirmation from '../../confirmation.enum';

@Entity('accounts')
export class UserEntitySql {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Expose()
  login: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ unique: true })
  @Expose()
  email: string;

  @Column({ default: null })
  telegram: string;

  @Column({ default: null })
  discord: string;

  @Column({
    type: 'enum',
    enum: Confirmation,
    default: Confirmation.uncorfirmed,
  })
  confirmation_type: Confirmation;

  @Column({ default: null })
  @Exclude()
  phone: string;

  @CreateDateColumn({ type: 'timestamp' })
  @Expose()
  created_time: Date;

  @Column({ default: 0, type: 'bigint' })
  last_active: number;

  @Column({ default: 0, type: 'tinyint' })
  access_level: number;

  @Column({ default: null })
  last_ip: string;

  @Column({ default: null })
  last_server: number;

  // @Column({ default: false })
  // @Expose()
  // isEmailConfirmed: boolean;

  // @OneToMany(
  //   () => PaymentEntityMySQL,
  //   (donation: PaymentEntityMySQL) => donation.user,
  //   {
  //     eager: true,
  //   },
  // )
  // @Expose()
  // donations: PaymentEntityMySQL[];
}
