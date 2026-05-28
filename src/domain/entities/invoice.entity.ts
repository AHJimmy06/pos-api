import { InvoiceDetail } from './invoice-detail.entity';
import { InvoiceStatus } from '../enums/invoice-status.enum';
import { PaymentMethod } from '../enums/payment-method.enum';

export class Invoice {
  id?: number;
  clientId: number;
  userId?: number;
  issueDate: Date;
  transactionId: string;
  status: InvoiceStatus;
  paymentMethod: PaymentMethod = PaymentMethod.CASH;
  isActive: boolean = true;
  version: number = 0;
  details: InvoiceDetail[] = [];
  private _subtotalSnapshot?: number;
  private _taxTotalSnapshot?: number;
  private _totalSnapshot?: number;

  constructor(clientId: number) {
    this.clientId = clientId;
    this.issueDate = new Date();
    this.transactionId = `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    this.status = InvoiceStatus.CONFIRMED;
  }

  // Explicitly exclude private fields from JSON serialization
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      clientId: this.clientId,
      userId: this.userId,
      issueDate: this.issueDate,
      transactionId: this.transactionId,
      status: this.status,
      paymentMethod: this.paymentMethod,
      isActive: this.isActive,
      version: this.version,
      details: this.details,
      subtotalSnapshot: this.subtotalSnapshot,
      taxTotalSnapshot: this.taxTotalSnapshot,
      totalSnapshot: this.totalSnapshot,
    };
  }

  addDetail(detail: InvoiceDetail): void {
    this.details.push(detail);
  }

  get subtotalSnapshot(): number {
    return (
      this._subtotalSnapshot ??
      this.details.reduce((sum, d) => sum + d.subtotal, 0)
    );
  }

  get taxTotalSnapshot(): number {
    return (
      this._taxTotalSnapshot ??
      this.details.reduce((sum, d) => sum + d.taxTotal, 0)
    );
  }

  get totalSnapshot(): number {
    return this._totalSnapshot ?? this.subtotalSnapshot + this.taxTotalSnapshot;
  }

  setSnapshots(subtotal: number, taxTotal: number, total: number): void {
    this._subtotalSnapshot = subtotal;
    this._taxTotalSnapshot = taxTotal;
    this._totalSnapshot = total;
  }

  clearDetails(): void {
    this.details = [];
  }
}
