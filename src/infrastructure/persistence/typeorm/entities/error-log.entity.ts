import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('ERROR_LOGS')
export class ErrorLogEntity {
  @PrimaryGeneratedColumn({ name: 'ID', type: 'number' })
  id!: number;

  @Column({ name: 'MESSAGE', type: 'clob' })
  message!: string;

  @Column({ name: 'STACK_TRACE', type: 'clob', nullable: true })
  stackTrace?: string;

  @Column({
    name: 'EXCEPTION_TYPE',
    type: 'varchar2',
    length: 255,
    nullable: true,
  })
  exceptionType?: string;

  @Column({ name: 'USER_ID', type: 'number', nullable: true })
  userId?: number;

  @Column({ name: 'PATH', type: 'varchar2', length: 255 })
  path!: string;

  @CreateDateColumn({ name: 'CREATED_AT', type: 'timestamp' })
  createdAt!: Date;
}
