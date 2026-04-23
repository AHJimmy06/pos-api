import { InvoiceDetail } from './invoice-detail.entity';

export class Invoice {
  id?: number;
  clientId: number;
  issueDate?: Date;
  subtotalSnapshot: number;
  taxTotalSnapshot: number;
  totalSnapshot: number;
  transactionId?: string;
  details: InvoiceDetail[];
}
