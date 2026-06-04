import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ReconstructInvoiceQuery } from './reconstruct-invoice.query';
import { Inject, NotFoundException } from '@nestjs/common';
import { IInvoiceRepository } from '../common/interfaces/invoice.repository.interface';
import { TOKENS } from '../common/tokens/tokens';
import { Invoice } from '../../domain/entities/invoice.entity';

@QueryHandler(ReconstructInvoiceQuery)
export class ReconstructInvoiceHandler
  implements IQueryHandler<ReconstructInvoiceQuery>
{
  constructor(
    @Inject(TOKENS.INVOICE_REPOSITORY)
    private readonly invoiceRepository: IInvoiceRepository,
  ) {}

  async execute(query: ReconstructInvoiceQuery): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findByTransactionId(
      query.transactionId,
    );

    if (!invoice) {
      throw new NotFoundException(
        `Invoice with transaction ID ${query.transactionId} not found`,
      );
    }

    return invoice;
  }
}
