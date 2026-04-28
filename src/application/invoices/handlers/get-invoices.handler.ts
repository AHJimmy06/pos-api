import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetInvoicesQuery } from '../queries/get-invoices.query';
import { Inject } from '@nestjs/common';
import { IInvoiceRepository } from '../../../domain/repositories/invoice.repository.interface';

@QueryHandler(GetInvoicesQuery)
export class GetInvoicesHandler implements IQueryHandler<GetInvoicesQuery> {
  constructor(
    @Inject('IInvoiceRepository')
    private readonly invoiceRepository: IInvoiceRepository,
  ) {}

  async execute(
    query: GetInvoicesQuery,
  ): Promise<{ data: any[]; total: number }> {
    return this.invoiceRepository.findAllPaginated(
      query.page,
      query.limit,
      query.searchId,
    );
  }
}
