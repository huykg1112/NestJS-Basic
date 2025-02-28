import { RolePermission } from '@modules/role_permissions/entities/role_permission.entity';
import { User } from '@modules/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description!: string;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updatedAt!: Date;

  @OneToMany(() => User, (user) => user.role)
  users!: User[];

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role)
  rolePermissions!: RolePermission[];
}
