import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('ROLES')
export class RoleEntity {
  @PrimaryGeneratedColumn({ name: 'ID', type: 'number' })
  id!: number;

  @Column({ name: 'NAME', type: 'varchar2', length: 50, unique: true })
  name!: string;

  @Column({
    name: 'DESCRIPTION',
    type: 'varchar2',
    length: 255,
    nullable: true,
  })
  description?: string;

  @ManyToMany(() => UserEntity, (user) => user.roles)
  users!: UserEntity[];
}
