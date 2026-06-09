import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetInvoicesQuery } from './get-invoices.query';
import { Inject } from '@nestjs/common';
import { IInvoiceRepository } from '../common/interfaces/invoice.repository.interface';
import { TOKENS } from '../common/tokens/tokens';
import { Invoice } from '../../domain/entities/invoice.entity';
import { InvoiceDetail } from '../../domain/entities/invoice-detail.entity';

/**
 * Converts an InvoiceEntity class instance to a plain object.
 * This forces all getters (subtotalSnapshot, taxTotalSnapshot, totalSnapshot)
 * to be evaluated so they appear in the JSON response.
 */
function detailToPlain(detail: InvoiceDetail): Record<string, unknown> {
  return {
    productId: detail.productId,
    productName: detail.productName,
    quantity: detail.quantity,
    unitPriceSnapshot: detail.unitPriceSnapshot,
    subtotal: detail.subtotal,
    taxTotal: detail.taxTotal,
    taxes: detail.detailTaxes.map((t) => ({
      taxId: t.taxId,
      rate: t.rateSnapshot,
      calculatedAmount: t.calculatedAmountSnapshot,
    })),
  };
}

function invoiceToPlain(invoice: Invoice): Record<string, unknown> {
  return {
    id: invoice.id,
    clientId: invoice.clientId,
    userId: invoice.userId,
    issueDate: invoice.issueDate,
    transactionId: invoice.transactionId,
    status: invoice.status,
    paymentMethod: invoice.paymentMethod,
    isActive: invoice.isActive,
    version: invoice.version,
    // Getters — must be explicitly accessed to be included in JSON
    subtotalSnapshot: invoice.subtotalSnapshot,
    taxTotalSnapshot: invoice.taxTotalSnapshot,
    totalSnapshot: invoice.totalSnapshot,
    clientNameSnapshot: invoice.clientNameSnapshot,
    clientEmailSnapshot: invoice.clientEmailSnapshot,
    sellerNameSnapshot: invoice.sellerNameSnapshot,
    // Include details so getters can calculate if snapshots are null
    details: invoice.details.map(detailToPlain),
  };
}

@QueryHandler(GetInvoicesQuery)
export class GetInvoicesHandler implements IQueryHandler<GetInvoicesQuery> {
  constructor(
    @Inject(TOKENS.INVOICE_REPOSITORY)
    private readonly invoiceRepository: IInvoiceRepository,
  ) {}

  async execute(
    query: GetInvoicesQuery,
  ): Promise<{ data: Record<string, unknown>[]; total: number }> {
    const result = await this.invoiceRepository.findAllPaginated(
      query.page,
      query.limit,
      query.searchId,
      query.userId,
    );
    return {
      data: result.data.map(invoiceToPlain),
      total: result.total,
    };
  }
}
