import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { MovementType } from '../../../../domain/enums/movement-type.enum';
import { ProductEntity } from './product.entity';

@Entity('STOCK_MOVEMENTS')
@Index(['productId'])
@Index(['createdAt'])
export class StockMovementEntity {
  @PrimaryGeneratedColumn({ name: 'ID', type: 'number' })
  id!: number;

  @Column({ name: 'PRODUCT_ID', type: 'number' })
  productId!: number;

  @Column({ name: 'TYPE', type: 'varchar2', length: 20 })
  type!: MovementType;

  @Column({ name: 'QUANTITY', type: 'number' })
  quantity!: number;

  @Column({ name: 'PREVIOUS_STOCK', type: 'number' })
  previousStock!: number;

  @Column({ name: 'NEW_STOCK', type: 'number' })
  newStock!: number;

  @Column({ name: 'USER_ID', type: 'number', nullable: true })
  userId?: number;

  @Column({ name: 'REFERENCE', type: 'varchar2', length: 255, nullable: true })
  reference?: string;

  @CreateDateColumn({ name: 'CREATED_AT', type: 'timestamp' })
  createdAt!: Date;

  @ManyToOne(() => ProductEntity, (product) => product.stockMovements)
  @JoinColumn({ name: 'PRODUCT_ID' })
  product!: ProductEntity;
}
