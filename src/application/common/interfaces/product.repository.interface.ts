import { Product } from '../../../domain/entities/product.entity';
import { DeleteResult } from '../../../domain/common/delete-result.interface';

export abstract class IProductRepository {
  abstract findAll(): Promise<Product[]>;
  abstract findForSale(
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ data: Product[]; total: number }>;
  abstract findAllPaginated(
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ data: Product[]; total: number }>;
  abstract findById(id: number): Promise<Product | null>;
  abstract findByIds(ids: number[]): Promise<Product[]>;
  abstract create(product: Product): Promise<Product>;
  abstract update(id: number, product: Partial<Product>): Promise<Product>;
  abstract delete(id: number): Promise<DeleteResult>;
  abstract reduceStock(params: {
    productId: number;
    quantity: number;
    expectedVersion: number;
  }): Promise<boolean>;
  abstract addStock(params: {
    productId: number;
    quantity: number;
    expectedVersion: number;
  }): Promise<boolean>;
}
