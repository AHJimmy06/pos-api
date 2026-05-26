import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { IProductRepository } from '../common/interfaces/product.repository.interface';
import { Product } from '../../domain/entities/product.entity';
import { GetProductsForSaleQuery } from './get-products-for-sale.query';
import { TOKENS } from '../common/tokens/tokens';

@QueryHandler(GetProductsForSaleQuery)
export class GetProductsForSaleHandler implements IQueryHandler<GetProductsForSaleQuery> {
  constructor(
    @Inject(TOKENS.PRODUCT_REPOSITORY)
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
