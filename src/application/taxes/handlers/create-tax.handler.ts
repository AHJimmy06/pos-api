import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateTaxCommand } from '../commands/create-tax.command';
import { Inject } from '@nestjs/common';
import { ITaxRepository } from '../../../domain/repositories/tax.repository.interface';
import { Tax } from '../../../domain/entities/tax.entity';

@CommandHandler(CreateTaxCommand)
export class CreateTaxHandler implements ICommandHandler<CreateTaxCommand> {
  constructor(
    @Inject('ITaxRepository')
    private readonly taxRepository: ITaxRepository,
  ) {}

  async execute(command: CreateTaxCommand): Promise<Tax> {
    const { name, currentRate } = command;
    const tax = new Tax(name, currentRate);

    return this.taxRepository.create(tax);
  }
}
