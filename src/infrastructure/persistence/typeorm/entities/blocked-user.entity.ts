import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('BLOCKED_USERS')
export class BlockedUserEntity {
  @PrimaryGeneratedColumn({ name: 'ID', type: 'number' })
  id!: number;

  @Column({ name: 'USER_ID', type: 'number', unique: true })
  userId!: number;

  @Column({ name: 'FAILED_ATTEMPTS', type: 'number', default: 0 })
  failedAttempts!: number;

  @Column({ name: 'BLOCKED_AT', type: 'timestamp', nullable: true })
  blockedAt?: Date;

  @OneToOne(() => UserEntity, (user) => user.blockedUsers)
  @JoinColumn({ name: 'USER_ID' })
  user!: UserEntity;
}
