import { InvoiceDetail } from './invoice-detail.entity';

export class Invoice {
  id?: number;
  clientId: number;
  issueDate: Date;
  transactionId: string;
  details: InvoiceDetail[] = [];

  constructor(clientId: number) {
    this.clientId = clientId;
    this.issueDate = new Date();
    this.transactionId = `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  addDetail(detail: InvoiceDetail): void {
    this.details.push(detail);
  }

  get subtotalSnapshot(): number {
    return this.details.reduce((sum, d) => sum + d.subtotal, 0);
  }

  get taxTotalSnapshot(): number {
    return this.details.reduce((sum, d) => sum + d.taxTotal, 0);
  }

  get totalSnapshot(): number {
    return this.subtotalSnapshot + this.taxTotalSnapshot;
  }
}
