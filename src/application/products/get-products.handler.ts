import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetProductsQuery } from './get-products.query';
import { IProductRepository } from '../common/interfaces/product.repository.interface';
import { Product } from '../../domain/entities/product.entity';
import { Inject } from '@nestjs/common';
import { TOKENS } from '../common/tokens/tokens';

@QueryHandler(GetProductsQuery)
export class GetProductsHandler implements IQueryHandler<GetProductsQuery> {
  constructor(
    @Inject(TOKENS.PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(
    query: GetProductsQuery,
  ): Promise<{ data: Product[]; total: number }> {
    return this.productRepository.findAllPaginated(
      query.page,
      query.limit,
      query.search,
      query.searchField,
    );
  }
}
