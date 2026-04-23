import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateProductCommand } from '../commands/update-product.command';
import { IProductRepository } from '../../../domain/products/repositories/product.repository.interface';
import { Product } from '../../../domain/products/entities/product.entity';
import { Inject } from '@nestjs/common';

@CommandHandler(UpdateProductCommand)
export class UpdateProductHandler implements ICommandHandler<UpdateProductCommand> {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(command: UpdateProductCommand): Promise<Product> {
    const { id, data } = command;
    return this.productRepository.update(id, data);
  }
}
