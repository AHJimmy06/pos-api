import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteTaxCommand } from '../commands/delete-tax.command';
import { Inject } from '@nestjs/common';
import { ITaxRepository } from '../../../domain/taxes/repositories/tax.repository.interface';

@CommandHandler(DeleteTaxCommand)
export class DeleteTaxHandler implements ICommandHandler<DeleteTaxCommand> {
  constructor(
    @Inject('ITaxRepository')
    private readonly taxRepository: ITaxRepository,
  ) {}

  async execute(command: DeleteTaxCommand): Promise<void> {
    const { id } = command;
    await this.taxRepository.delete(id);
  }
}
