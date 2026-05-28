import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { InvoiceEntity } from './invoice.entity';

@Entity('CLIENTS')
export class ClientEntity {
  @PrimaryGeneratedColumn({ name: 'ID', type: 'number' })
  id!: number;

  @Column({ name: 'FIRST_NAME', type: 'varchar2', length: 255, nullable: true })
  firstName?: string;

  @Column({ name: 'LAST_NAME', type: 'varchar2', length: 255, nullable: true })
  lastName?: string;

  @Column({
    name: 'EMAIL',
    type: 'varchar2',
    length: 255,
    unique: true,
    nullable: true,
  })
  email?: string;

  @Column({ name: 'PHONE', type: 'varchar2', length: 50, nullable: true })
  phone?: string;

  @Column({ name: 'ADDRESS', type: 'varchar2', length: 255, nullable: true })
  address?: string;

  @Column({ name: 'IS_ACTIVE', type: 'number', width: 1, default: 1 })
  isActive!: number;

  @CreateDateColumn({ name: 'CREATED_AT', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'UPDATED_AT', type: 'timestamp', nullable: true })
  updatedAt?: Date;

  @DeleteDateColumn({ name: 'DELETED_AT', type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @OneToMany(() => InvoiceEntity, (invoice) => invoice.client)
  invoices!: InvoiceEntity[];
}
