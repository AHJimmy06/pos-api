import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTaxQuery } from './get-tax.query';
import { Inject } from '@nestjs/common';
import { ITaxRepository } from '../common/interfaces/tax.repository.interface';
import { Tax } from '../../domain/entities/tax.entity';
import { TOKENS } from '../common/tokens/tokens';

@QueryHandler(GetTaxQuery)
export class GetTaxHandler implements IQueryHandler<GetTaxQuery> {
  constructor(
    @Inject(TOKENS.TAX_REPOSITORY)
    private readonly taxRepository: ITaxRepository,
  ) {}

  async execute(query: GetTaxQuery): Promise<Tax | null> {
    return this.taxRepository.findById(query.id);
  }
}
