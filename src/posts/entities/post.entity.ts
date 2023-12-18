import { Exclude, Expose } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntityPg } from '../../users/entities/pg/user.entity';
import LocalFile from '../../localFiles/entities/localFile.entity';

@Entity('posts')
export class PostEntity {
  @Expose()
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Expose()
  name: string;

  @Column({ nullable: true })
  @Expose()
  nameRu: string;

  @Expose()
  @Column({ unique: true })
  slug: string;

  @Column()
  @Expose()
  content: string;

  @Column({ nullable: true })
  @Expose()
  contentRu: string;

  @CreateDateColumn({ type: 'timestamp' })
  @Expose()
  registeredAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  @Expose()
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date;

  @Expose()
  @ManyToOne(() => UserEntityPg, (user: UserEntityPg) => user.posts)
  user: UserEntityPg;

  @RelationId((post: PostEntity) => post.user)
  @Exclude()
  userId: number;

  @Expose()
  @JoinColumn({ name: 'bannerId' })
  @OneToOne(() => LocalFile, {
    nullable: true,
    eager: true,
  })
  @Expose()
  banner?: LocalFile;
}
