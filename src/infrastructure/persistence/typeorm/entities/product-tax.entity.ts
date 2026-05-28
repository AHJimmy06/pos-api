import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ProductEntity } from './product.entity';
import { TaxEntity } from './tax.entity';

@Entity('PRODUCT_TAXES')
@Index(['productId'])
@Index(['taxId'])
export class ProductTaxEntity {
  @PrimaryGeneratedColumn({ name: 'ID', type: 'number' })
  id!: number;

  @Column({ name: 'PRODUCT_ID', type: 'number' })
  productId!: number;

  @Column({ name: 'TAX_ID', type: 'number' })
  taxId!: number;

  @ManyToOne(() => ProductEntity, (product) => product.productTaxes)
  @JoinColumn({ name: 'PRODUCT_ID' })
  product!: ProductEntity;

  @ManyToOne(() => TaxEntity, (tax) => tax.productTaxes)
  @JoinColumn({ name: 'TAX_ID' })
  tax!: TaxEntity;
}
