import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateProductCommand } from './create-product.command';
import { IProductRepository } from '../common/interfaces/product.repository.interface';
import { Product } from '../../domain/entities/product.entity';
import { Inject } from '@nestjs/common';
import { TOKENS } from '../common/tokens/tokens';

@CommandHandler(CreateProductCommand)
export class CreateProductHandler implements ICommandHandler<CreateProductCommand> {
  constructor(
    @Inject(TOKENS.PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(command: CreateProductCommand): Promise<Product> {
    const { name, price, stock, taxIds } = command;
    const product = new Product(name, price, stock);
    product.taxIds = taxIds ?? [];

    return this.productRepository.create(product);
  }
}
