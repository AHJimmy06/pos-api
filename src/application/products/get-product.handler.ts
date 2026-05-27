import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetProductQuery } from './get-product.query';
import { IProductRepository } from '../common/interfaces/product.repository.interface';
import { Product } from '../../domain/entities/product.entity';
import { Inject, NotFoundException } from '@nestjs/common';
import { TOKENS } from '../common/tokens/tokens';

@QueryHandler(GetProductQuery)
export class GetProductHandler implements IQueryHandler<GetProductQuery> {
  constructor(
    @Inject(TOKENS.PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(query: GetProductQuery): Promise<Product> {
    const product = await this.productRepository.findById(query.id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${query.id} not found`);
    }
    return product;
  }
}
