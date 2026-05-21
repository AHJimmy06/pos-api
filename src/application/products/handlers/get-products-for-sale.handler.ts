import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IProductRepository } from '../../../domain/repositories/product.repository.interface';
import { Product } from '../../../domain/entities/product.entity';
import { GetProductsForSaleQuery } from '../queries/get-products-for-sale.query';

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
