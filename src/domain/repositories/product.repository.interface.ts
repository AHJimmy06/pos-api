import { Product } from '../entities/product.entity';

export abstract class IProductRepository {
  abstract findAll(): Promise<Product[]>;
  abstract findById(id: number): Promise<Product | null>;
  abstract create(product: Product): Promise<Product>;
  abstract update(id: number, product: Partial<Product>): Promise<Product>;
  abstract delete(id: number): Promise<void>;
  abstract reduceStock(params: {
    productId: number;
    quantity: number;
    expectedVersion: number;
  }): Promise<boolean>;
}
