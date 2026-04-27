import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetInvoiceQuery } from '../queries/get-invoice.query';
import { Inject, NotFoundException } from '@nestjs/common';
import { IInvoiceRepository } from '../../../domain/repositories/invoice.repository.interface';
import { Invoice } from '../../../domain/entities/invoice.entity';

@QueryHandler(GetInvoiceQuery)
export class GetInvoiceHandler implements IQueryHandler<GetInvoiceQuery> {
  constructor(
    @Inject('IInvoiceRepository')
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
