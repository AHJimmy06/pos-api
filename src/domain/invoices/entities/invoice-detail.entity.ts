import { InvoiceDetailTax } from './invoice-detail-tax.entity';

export class InvoiceDetail {
  id?: number;
  invoiceId?: number;
  productId: number;
  quantity: number;
  unitPriceSnapshot: number;
  detailTaxes?: InvoiceDetailTax[];
}
