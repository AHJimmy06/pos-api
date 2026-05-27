import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateTaxCommand } from './create-tax.command';
import { Inject } from '@nestjs/common';
import { ITaxRepository } from '../common/interfaces/tax.repository.interface';
import { Tax } from '../../domain/entities/tax.entity';
import { TOKENS } from '../common/tokens/tokens';

@CommandHandler(CreateTaxCommand)
export class CreateTaxHandler implements ICommandHandler<CreateTaxCommand> {
  constructor(
    @Inject(TOKENS.TAX_REPOSITORY)
    private readonly taxRepository: ITaxRepository,
  ) {}

  async execute(command: CreateTaxCommand): Promise<Tax> {
    const { name, currentRate } = command;
    const tax = new Tax(name, currentRate);

    return this.taxRepository.create(tax);
  }
}
