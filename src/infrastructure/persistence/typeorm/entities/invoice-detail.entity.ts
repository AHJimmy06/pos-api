import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { InvoiceEntity } from './invoice.entity';
import { ProductEntity } from './product.entity';
import { TaxEntity } from './tax.entity';

@Entity('INVOICE_DETAILS')
@Index(['invoiceId'])
@Index(['productId'])
export class InvoiceDetailEntity {
  @PrimaryGeneratedColumn({ name: 'ID', type: 'number' })
  id!: number;

  @Column({ name: 'INVOICE_ID', type: 'number', nullable: true })
  invoiceId?: number;

  @Column({ name: 'PRODUCT_ID', type: 'number', nullable: true })
  productId?: number;

  @Column({
    name: 'PRODUCT_NAME',
    type: 'varchar2',
    length: 255,
    nullable: true,
  })
  productName?: string;

  @Column({ name: 'QUANTITY', type: 'number', nullable: true })
  quantity?: number;

  @Column({
    name: 'UNIT_PRICE_SNAPSHOT',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  unitPriceSnapshot!: number;

  @ManyToOne(() => InvoiceEntity, (invoice) => invoice.details)
  @JoinColumn({ name: 'INVOICE_ID' })
  invoice?: InvoiceEntity;

  @ManyToOne(() => ProductEntity, (product) => product.invoiceDetails)
  @JoinColumn({ name: 'PRODUCT_ID' })
  product?: ProductEntity;
}

@Entity('INVOICE_DETAIL_TAXES')
@Index(['detailId'])
@Index(['taxId'])
export class InvoiceDetailTaxEntity {
  @PrimaryGeneratedColumn({ name: 'ID', type: 'number' })
  id!: number;

  @Column({ name: 'DETAIL_ID', type: 'number', nullable: true })
  detailId?: number;

  @Column({ name: 'TAX_ID', type: 'number', nullable: true })
  taxId?: number;

  @Column({
    name: 'RATE_SNAPSHOT',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  rateSnapshot!: number;

  @Column({
    name: 'CALCULATED_AMOUNT_SNAPSHOT',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  calculatedAmountSnapshot!: number;

  @ManyToOne(() => InvoiceDetailEntity)
  @JoinColumn({ name: 'DETAIL_ID' })
  invoiceDetail?: InvoiceDetailEntity;

  @ManyToOne(() => TaxEntity)
  @JoinColumn({ name: 'TAX_ID' })
  tax?: TaxEntity;
}
