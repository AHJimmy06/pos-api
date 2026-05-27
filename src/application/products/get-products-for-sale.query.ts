import { IProductRepository } from '../common/interfaces/product.repository.interface';

export class GetProductsForSaleQuery {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly search?: string,
    public readonly searchField?: string,
  ) {}
}
