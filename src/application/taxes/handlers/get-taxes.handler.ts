import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTaxesQuery } from '../queries/get-taxes.query';
import { Inject } from '@nestjs/common';
import { ITaxRepository } from '../../../domain/repositories/tax.repository.interface';
import { Tax } from '../../../domain/entities/tax.entity';

@QueryHandler(GetTaxesQuery)
export class GetTaxesHandler implements IQueryHandler<GetTaxesQuery> {
  constructor(
    @Inject('ITaxRepository')
    private readonly taxRepository: ITaxRepository,
  ) {}

  async execute(
    query: GetTaxesQuery,
  ): Promise<{ data: Tax[]; total: number } | Tax[]> {
    if (query.page && query.limit) {
      return this.taxRepository.findAllPaginated(
        query.page,
        query.limit,
        query.search,
      );
    }
    return this.taxRepository.findAll();
  }
}
