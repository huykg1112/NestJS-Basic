import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
// import { Order } from '../order/order.entity'; // Đảm bảo rằng Order được import đúng cách

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  username!: string;

  @Column({ type: 'varchar', length: 100 })
  password!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email!: string;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  updatedAt!: Date;

  // @OneToMany(() => Order, (order) => order.user)
  // orders!: Order[];
}
