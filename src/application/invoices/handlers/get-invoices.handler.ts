import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetInvoicesQuery } from '../queries/get-invoices.query';
import { Inject } from '@nestjs/common';
import { IInvoiceRepository } from '../../../domain/repositories/invoice.repository.interface';
import { Invoice } from '../../../domain/entities/invoice.entity';

@QueryHandler(GetInvoicesQuery)
export class GetInvoicesHandler implements IQueryHandler<GetInvoicesQuery> {
  constructor(
    @Inject('IInvoiceRepository')
    private readonly invoiceRepository: IInvoiceRepository,
  ) {}

  async execute(): Promise<Invoice[]> {
    return this.invoiceRepository.findAll();
  }
}
