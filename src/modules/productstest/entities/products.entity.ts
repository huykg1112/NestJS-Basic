import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100, unique: true }) // unique: true để đảm bảo rằng không có 2 sản phẩm trùng tên
  name!: string;

  @Column({ type: 'varchar', length: 255, default: '', nullable: true })
  description: string;

  @Column({ type: 'int', default: 0, nullable: true })
  price: number;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  updatedAt!: Date;

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  deletedAt!: Date;
}
