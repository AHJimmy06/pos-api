import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IProductRepository } from '../../../domain/repositories/product.repository.interface';
import { Product } from '../../../domain/entities/product.entity';

export class GetProductsForSaleQuery {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly search?: string,
    public readonly searchField?: string,
  ) {}
}

@QueryHandler(GetProductsForSaleQuery)
export class GetProductsForSaleHandler implements IQueryHandler<GetProductsForSaleQuery> {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(
    query: GetProductsForSaleQuery,
  ): Promise<{ data: Product[]; total: number }> {
    return this.productRepository.findForSale(
      query.page,
      query.limit,
      query.search,
    );
  }
}
