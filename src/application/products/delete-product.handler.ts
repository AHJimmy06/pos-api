import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteProductCommand } from './delete-product.command';
import { IProductRepository } from '../common/interfaces/product.repository.interface';
import { Inject } from '@nestjs/common';
import { DeleteResult } from '../../domain/common/delete-result.interface';
import { TOKENS } from '../common/tokens/tokens';

@CommandHandler(DeleteProductCommand)
export class DeleteProductHandler implements ICommandHandler<DeleteProductCommand> {
  constructor(
    @Inject(TOKENS.PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(command: DeleteProductCommand): Promise<DeleteResult> {
    return this.productRepository.delete(command.id);
  }
}
