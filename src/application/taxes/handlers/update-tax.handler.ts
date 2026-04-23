import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateTaxCommand } from '../commands/update-tax.command';
import { Inject } from '@nestjs/common';
import { ITaxRepository } from '../../../domain/taxes/repositories/tax.repository.interface';
import { Tax } from '../../../domain/taxes/entities/tax.entity';

@CommandHandler(UpdateTaxCommand)
export class UpdateTaxHandler implements ICommandHandler<UpdateTaxCommand> {
  constructor(
    @Inject('ITaxRepository')
    private readonly taxRepository: ITaxRepository,
  ) {}

  async execute(command: UpdateTaxCommand): Promise<Tax> {
    const { id, taxData } = command;
    return this.taxRepository.update(id, taxData);
  }
}
