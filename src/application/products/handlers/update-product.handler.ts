import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateProductCommand } from '../commands/update-product.command';
import { IProductRepository } from '../../../domain/repositories/product.repository.interface';
import { Product } from '../../../domain/entities/product.entity';
import { Inject, NotFoundException } from '@nestjs/common';

@CommandHandler(UpdateProductCommand)
export class UpdateProductHandler implements ICommandHandler<UpdateProductCommand> {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(command: UpdateProductCommand): Promise<Product> {
    const { id, data } = command;
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Rehidratamos la entidad si el repositorio devolvió un objeto plano
    const productEntity = new Product(
      product.name,
      product.price,
      product.stock,
    );
    productEntity.id = product.id;
    productEntity.taxIds = product.taxIds;

    if (data.name) productEntity.name = data.name;
    if (data.price !== undefined) productEntity.updatePrice(data.price);
    if (data.stock !== undefined) productEntity.stock = data.stock;
    if (data.taxIds !== undefined) productEntity.taxIds = data.taxIds;

    return this.productRepository.update(id, productEntity);
  }
}
