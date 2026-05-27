import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetInvoicesQuery } from './get-invoices.query';
import { Inject } from '@nestjs/common';
import { IInvoiceRepository } from '../common/interfaces/invoice.repository.interface';
import { TOKENS } from '../common/tokens/tokens';

@QueryHandler(GetInvoicesQuery)
export class GetInvoicesHandler implements IQueryHandler<GetInvoicesQuery> {
  constructor(
    @Inject(TOKENS.INVOICE_REPOSITORY)
    private readonly invoiceRepository: IInvoiceRepository,
  ) {}

  async execute(
    query: GetInvoicesQuery,
  ): Promise<{ data: any[]; total: number }> {
    return this.invoiceRepository.findAllPaginated(
      query.page,
      query.limit,
      query.searchId,
      query.userId,
    );
  }
}
