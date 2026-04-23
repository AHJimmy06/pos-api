import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTaxesQuery } from '../queries/get-taxes.query';
import { Inject } from '@nestjs/common';
import { ITaxRepository } from '../../../domain/taxes/repositories/tax.repository.interface';
import { Tax } from '../../../domain/taxes/entities/tax.entity';

@QueryHandler(GetTaxesQuery)
export class GetTaxesHandler implements IQueryHandler<GetTaxesQuery> {
  constructor(
    @Inject('ITaxRepository')
    private readonly taxRepository: ITaxRepository,
  ) {}

  async execute(): Promise<Tax[]> {
    return this.taxRepository.findAll();
  }
}
