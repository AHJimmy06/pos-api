import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  VersionColumn,
} from 'typeorm';
import { ClientEntity } from './client.entity';
import { UserEntity } from './user.entity';
import { InvoiceDetailEntity } from './invoice-detail.entity';
import { InvoiceStatus } from '../../../../domain/enums/invoice-status.enum';
import { PaymentMethod } from '../../../../domain/enums/payment-method.enum';

@Entity('INVOICES')
@Index(['clientId'])
@Index(['userId'])
@Index(['issueDate'])
export class InvoiceEntity {
  @PrimaryGeneratedColumn({ name: 'ID', type: 'number' })
  id!: number;

  @Column({ name: 'CLIENT_ID', type: 'number', nullable: true })
  clientId?: number;

  @Column({ name: 'USER_ID', type: 'number', nullable: true })
  userId?: number;

  @CreateDateColumn({ name: 'ISSUE_DATE', type: 'timestamp' })
  issueDate!: Date;

  @Column({
    name: 'SUBTOTAL_SNAPSHOT',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  subtotalSnapshot!: number;

  @Column({
    name: 'TAX_TOTAL_SNAPSHOT',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  taxTotalSnapshot!: number;

  @Column({
    name: 'TOTAL_SNAPSHOT',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  totalSnapshot!: number;

  @Column({
    name: 'TRANSACTION_ID',
    type: 'varchar2',
    length: 255,
    nullable: true,
  })
  transactionId?: string;

  @Column({
    name: 'STATUS',
    type: 'varchar2',
    length: 20,
    default: InvoiceStatus.CONFIRMED,
  })
  status!: string;

  @Column({
    name: 'PAYMENT_METHOD',
    type: 'varchar2',
    length: 20,
    default: PaymentMethod.CASH,
  })
  paymentMethod!: string;

  @Column({ name: 'IS_ACTIVE', type: 'number', width: 1, default: 1 })
  isActive!: number;

  @VersionColumn({ name: 'VERSION', default: 0 })
  version!: number;

  @ManyToOne(() => ClientEntity, (client) => client.invoices)
  @JoinColumn({ name: 'CLIENT_ID' })
  client?: ClientEntity;

  @ManyToOne(() => UserEntity, (user) => user.invoices)
  @JoinColumn({ name: 'USER_ID' })
  user?: UserEntity;

  @OneToMany(() => InvoiceDetailEntity, (detail) => detail.invoice)
  details!: InvoiceDetailEntity[];
}
