import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateProductCommand } from '../commands/create-product.command';
import { IProductRepository } from '../../../domain/products/repositories/product.repository.interface';
import { Product } from '../../../domain/products/entities/product.entity';
import { Inject } from '@nestjs/common';

@CommandHandler(CreateProductCommand)
export class CreateProductHandler implements ICommandHandler<CreateProductCommand> {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(command: CreateProductCommand): Promise<Product> {
    const { name, price, stock } = command;
    const product = new Product();
    product.name = name;
    product.price = price;
    product.stock = stock;

    return this.productRepository.create(product);
  }
}
