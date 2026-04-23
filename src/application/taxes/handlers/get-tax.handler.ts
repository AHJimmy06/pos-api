import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTaxQuery } from '../queries/get-tax.query';
import { Inject } from '@nestjs/common';
import { ITaxRepository } from '../../../domain/taxes/repositories/tax.repository.interface';
import { Tax } from '../../../domain/taxes/entities/tax.entity';

@QueryHandler(GetTaxQuery)
export class GetTaxHandler implements IQueryHandler<GetTaxQuery> {
  constructor(
    @Inject('ITaxRepository')
    private readonly taxRepository: ITaxRepository,
  ) {}

  async execute(query: GetTaxQuery): Promise<Tax | null> {
    return this.taxRepository.findById(query.id);
  }
}
