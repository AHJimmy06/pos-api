import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteProductCommand } from '../commands/delete-product.command';
import { IProductRepository } from '../../../domain/repositories/product.repository.interface';
import { Inject } from '@nestjs/common';
import { DeleteResult } from '../../../domain/common/delete-result.interface';

@CommandHandler(DeleteProductCommand)
export class DeleteProductHandler implements ICommandHandler<DeleteProductCommand> {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(command: DeleteProductCommand): Promise<DeleteResult> {
    return this.productRepository.delete(command.id);
  }
}
