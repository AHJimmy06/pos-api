import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateTaxCommand } from './update-tax.command';
import { Inject } from '@nestjs/common';
import { ITaxRepository } from '../common/interfaces/tax.repository.interface';
import { Tax } from '../../domain/entities/tax.entity';
import { TOKENS } from '../common/tokens/tokens';

@CommandHandler(UpdateTaxCommand)
export class UpdateTaxHandler implements ICommandHandler<UpdateTaxCommand> {
  constructor(
    @Inject(TOKENS.TAX_REPOSITORY)
    private readonly taxRepository: ITaxRepository,
  ) {}

  async execute(command: UpdateTaxCommand): Promise<Tax> {
    const { id, taxData } = command;
    return this.taxRepository.update(id, taxData);
  }
}
