import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { ProductEntity } from './product.entity';
import { ProductTaxEntity } from './product-tax.entity';

@Entity('TAXES')
export class TaxEntity {
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
    name: 'CURRENT_RATE',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  currentRate!: number;

  @OneToMany(() => ProductTaxEntity, (pt) => pt.tax)
  productTaxes!: ProductTaxEntity[];

  @ManyToMany(() => ProductEntity, (product) => product.productTaxes)
  products!: ProductEntity[];
}
