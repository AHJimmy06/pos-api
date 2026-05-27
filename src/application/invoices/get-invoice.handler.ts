import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetInvoiceQuery } from './get-invoice.query';
import { Inject, NotFoundException } from '@nestjs/common';
import { IInvoiceRepository } from '../common/interfaces/invoice.repository.interface';
import { Invoice } from '../../domain/entities/invoice.entity';
import { TOKENS } from '../common/tokens/tokens';

@QueryHandler(GetInvoiceQuery)
export class GetInvoiceHandler implements IQueryHandler<GetInvoiceQuery> {
  constructor(
    @Inject(TOKENS.INVOICE_REPOSITORY)
    private readonly invoiceRepository: IInvoiceRepository,
  ) {}

  async execute(query: GetInvoiceQuery): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findById(query.id);
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${query.id} not found`);
    }
    return invoice;
  }
}
