import { Invoice } from '../../../domain/entities/invoice.entity';

export abstract class IInvoiceRepository {
  abstract create(invoice: Invoice): Promise<Invoice>;
  abstract findAll(): Promise<Invoice[]>;
  abstract findAllPaginated(
    page: number,
    limit: number,
    searchId?: number,
    userId?: number,
    searchField?: string,
  ): Promise<{ data: Invoice[]; total: number }>;
  abstract findById(id: number): Promise<Invoice | null>;
  abstract findByIdWithDetails(id: number): Promise<Invoice | null>;
  abstract findByTransactionId(transactionId: string): Promise<Invoice | null>;
  abstract update(id: number, invoice: Invoice): Promise<Invoice>;
}
