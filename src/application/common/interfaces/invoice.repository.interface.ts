import { Invoice } from '../../../domain/entities/invoice.entity';

export interface InvoiceStats {
  totalInvoices: number;
  totalSales: number;
  salesByDay: { date: string; total: number; count: number }[];
}

export abstract class IInvoiceRepository {
  abstract create(invoice: Invoice): Promise<Invoice>;
  abstract findAll(): Promise<Invoice[]>;
  abstract getStats(): Promise<InvoiceStats>;
  abstract findAllPaginated(
    page: number,
    limit: number,
    searchId?: number,
    userId?: number,
    searchField?: string,
  ): Promise<{ data: Invoice[]; total: number }>;
  abstract findById(id: number): Promise<Invoice | null>;
  abstract findByIdWithDetails(id: number): Promise<Invoice | null>;
  abstract update(id: number, invoice: Invoice): Promise<Invoice>;
}
