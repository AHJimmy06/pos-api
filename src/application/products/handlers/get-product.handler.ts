import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetProductQuery } from '../queries/get-product.query';
import { IProductRepository } from '../../../domain/products/repositories/product.repository.interface';
import { Product } from '../../../domain/products/entities/product.entity';
import { Inject, NotFoundException } from '@nestjs/common';

@QueryHandler(GetProductQuery)
export class GetProductHandler implements IQueryHandler<GetProductQuery> {
  constructor(
    @Inject('IProductRepository')
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
