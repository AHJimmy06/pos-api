import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  VersionColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { InvoiceDetailEntity } from './invoice-detail.entity';
import { StockMovementEntity } from './stock-movement.entity';
import { ProductTaxEntity } from './product-tax.entity';

@Entity('PRODUCTS')
@Index(['isActive', 'stock'])
export class ProductEntity {
  @PrimaryGeneratedColumn({ name: 'ID', type: 'number' })
  id!: number;

  @Column({
    name: 'NAME',
    type: 'varchar2',
    length: 255,
    unique: true,
    nullable: true,
  })
  name?: string;

  @Column({
    name: 'PRICE',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  price!: number;

  @Column({ name: 'STOCK', type: 'number', nullable: true })
  stock?: number;

  @VersionColumn({ name: 'VERSION', default: 0 })
  version!: number;

  @Column({ name: 'IS_ACTIVE', type: 'number', width: 1, default: 1 })
  isActive!: number;

  @OneToMany(() => ProductTaxEntity, (pt) => pt.product)
  productTaxes!: ProductTaxEntity[];

  @OneToMany(() => InvoiceDetailEntity, (detail) => detail.product)
  invoiceDetails!: InvoiceDetailEntity[];

  @OneToMany(() => StockMovementEntity, (movement) => movement.product)
  stockMovements!: StockMovementEntity[];
}
