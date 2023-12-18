import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Expose } from 'class-transformer';

@Entity()
class LocalFile {
  @PrimaryGeneratedColumn()
  id: number;

  @Expose()
  @Column()
  key: string;

  @Expose()
  @Column()
  location: string;
}

export default LocalFile;
