import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { RoleEntity } from './role.entity';
import { UserRoleEntity } from './user-role.entity';
import { BlockedUserEntity } from './blocked-user.entity';
import { InvoiceEntity } from './invoice.entity';

@Entity('USERS')
export class UserEntity {
  @PrimaryGeneratedColumn({ name: 'ID', type: 'number' })
  id!: number;

  @Column({ name: 'USERNAME', type: 'varchar2', length: 50, unique: true })
  username!: string;

  @Column({ name: 'NAME', type: 'varchar2', length: 100 })
  name!: string;

  @Column({ name: 'LAST_NAME', type: 'varchar2', length: 100 })
  lastName!: string;

  @Column({ name: 'CEDULA', type: 'varchar2', length: 20, nullable: true })
  cedula?: string;

  @Column({ name: 'EMAIL', type: 'varchar2', length: 255, unique: true })
  email!: string;

  @Column({ name: 'PASSWORD', type: 'varchar2', length: 255 })
  password!: string;

  @Column({ name: 'IS_ACTIVE', type: 'number', width: 1, default: 1 })
  isActive!: number;

  @CreateDateColumn({ name: 'CREATED_AT', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'UPDATED_AT', type: 'timestamp' })
  updatedAt!: Date;

  @ManyToMany(() => RoleEntity, (role) => role.users)
  @JoinTable({
    name: 'USER_ROLES',
    joinColumn: { name: 'USER_ID', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'ROLE_ID', referencedColumnName: 'id' },
  })
  roles!: RoleEntity[];

  @OneToMany(() => UserRoleEntity, (ur) => ur.user)
  userRoles!: UserRoleEntity[];

  @OneToMany(() => BlockedUserEntity, (blocked) => blocked.user)
  blockedUsers!: BlockedUserEntity[];

  @OneToMany(() => InvoiceEntity, (invoice) => invoice.user)
  invoices!: InvoiceEntity[];
}
