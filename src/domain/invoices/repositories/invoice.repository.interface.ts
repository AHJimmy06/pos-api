import { Invoice } from '../entities/invoice.entity';

export abstract class IInvoiceRepository {
  abstract create(invoice: Invoice): Promise<Invoice>;
  abstract findAll(): Promise<Invoice[]>;
  abstract findById(id: number): Promise<Invoice | null>;
}
