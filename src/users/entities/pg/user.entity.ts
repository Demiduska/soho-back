import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  JoinColumn,
  OneToOne,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import Role from '../../../roles/role.enum';
import { PostEntity } from '../../../posts/entities/post.entity';

@Entity('users')
export class UserEntityPg {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  @Expose()
  firstName: string;

  @Column({ nullable: true })
  @Expose()
  lastName: string;

  @Column({ nullable: true, unique: true })
  @Expose()
  nickName: string;

  @Column({ nullable: true })
  @Expose()
  telegram: string;

  @Column({ unique: true })
  @Expose()
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ default: false })
  @Expose()
  isEmailConfirmed: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  @Expose()
  registeredAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  @Expose()
  updatedAt: Date;

  @Column({ default: true })
  @Expose()
  isActive: boolean;

  @Column({
    nullable: true,
  })
  @Exclude()
  currentHashedRefreshToken?: string;

  @Expose()
  @Column({
    type: 'enum',
    enum: Role,
    default: Role.User,
  })
  role: Role;

  @OneToMany(() => PostEntity, (post: PostEntity) => post.user, {
    eager: true,
  })
  @Expose()
  posts: PostEntity[];
}
