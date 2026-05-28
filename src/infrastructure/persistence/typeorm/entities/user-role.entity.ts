import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { RoleEntity } from './role.entity';

@Entity('USER_ROLES')
export class UserRoleEntity {
  @PrimaryColumn({ name: 'USER_ID', type: 'number' })
  userId!: number;

  @PrimaryColumn({ name: 'ROLE_ID', type: 'number' })
  roleId!: number;

  @ManyToOne(() => UserEntity, (user) => user.userRoles)
  @JoinColumn({ name: 'USER_ID' })
  user!: UserEntity;

  @ManyToOne(() => RoleEntity, (role) => role.users)
  @JoinColumn({ name: 'ROLE_ID' })
  role!: RoleEntity;
}
