import { Invoice } from '../../../domain/entities/invoice.entity';

export abstract class IPdfService {
  abstract generateInvoicePdf(invoice: Invoice): Promise<Buffer>;
}
