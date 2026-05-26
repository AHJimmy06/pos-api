import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteTaxCommand } from './delete-tax.command';
import { Inject } from '@nestjs/common';
import { ITaxRepository } from '../common/interfaces/tax.repository.interface';
import { TOKENS } from '../common/tokens/tokens';

@CommandHandler(DeleteTaxCommand)
export class DeleteTaxHandler implements ICommandHandler<DeleteTaxCommand> {
  constructor(
    @Inject(TOKENS.TAX_REPOSITORY)
    private readonly taxRepository: ITaxRepository,
  ) {}

  async execute(command: DeleteTaxCommand): Promise<void> {
    const { id } = command;
    await this.taxRepository.delete(id);
  }
}
