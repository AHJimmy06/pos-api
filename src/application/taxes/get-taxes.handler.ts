import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTaxesQuery } from './get-taxes.query';
import { Inject } from '@nestjs/common';
import { ITaxRepository } from '../common/interfaces/tax.repository.interface';
import { Tax } from '../../domain/entities/tax.entity';
import { TOKENS } from '../common/tokens/tokens';

@QueryHandler(GetTaxesQuery)
export class GetTaxesHandler implements IQueryHandler<GetTaxesQuery> {
  constructor(
    @Inject(TOKENS.TAX_REPOSITORY)
    private readonly taxRepository: ITaxRepository,
  ) {}

  async execute(): Promise<Tax[]> {
    return this.taxRepository.findAll();
  }
}
