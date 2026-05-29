import { Invoice } from '../../../../domain/entities/invoice.entity';
import { InvoiceDetail } from '../../../../domain/entities/invoice-detail.entity';
import { InvoiceStatus } from '../../../../domain/enums/invoice-status.enum';
import { PaymentMethod } from '../../../../domain/enums/payment-method.enum';

interface RawInvoiceDetailTax {
  id: number;
  taxId: number;
  rateSnapshot: number;
  calculatedAmountSnapshot: number;
}

interface RawInvoiceDetail {
  id: number;
  invoiceId: number;
  productId?: number;
  productName?: string;
  quantity?: number;
  unitPriceSnapshot: number;
  detailTaxes: RawInvoiceDetailTax[];
}

interface RawInvoice {
  id: number;
  clientId: number;
  userId?: number;
  issueDate: Date;
  subtotalSnapshot: number;
  taxTotalSnapshot: number;
  totalSnapshot: number;
  transactionId?: string;
  status: string;
  paymentMethod: string;
  isActive: number;
  version: number;
  details: RawInvoiceDetail[];
}

export class InvoiceMapper {
  static toEntity(raw: RawInvoice): Invoice {
    const invoice = new Invoice(raw.clientId);
    invoice.id = raw.id;
    invoice.userId = raw.userId;
    invoice.issueDate = raw.issueDate;
    invoice.transactionId = raw.transactionId || '';
    invoice.status = raw.status as InvoiceStatus;
    invoice.paymentMethod = raw.paymentMethod as PaymentMethod;
    invoice.isActive = raw.isActive === 1;
    invoice.version = raw.version;

    // Set explicit snapshot values if provided
    invoice.setSnapshots(
      raw.subtotalSnapshot,
      raw.taxTotalSnapshot,
      raw.totalSnapshot,
    );

    // Map details
    for (const rawDetail of raw.details) {
      const detail = new InvoiceDetail(
        rawDetail.productId || 0,
        rawDetail.quantity || 0,
        Number(rawDetail.unitPriceSnapshot),
      );
      detail.id = rawDetail.id;
      detail.invoiceId = rawDetail.invoiceId;
      detail.productName = rawDetail.productName || '';

      // Map taxes
      for (const rawTax of rawDetail.detailTaxes) {
        detail.addTax(rawTax.taxId, Number(rawTax.rateSnapshot));
        const lastTax = detail.detailTaxes[detail.detailTaxes.length - 1];
        lastTax.id = rawTax.id;
        lastTax.calculatedAmountSnapshot = Number(
          rawTax.calculatedAmountSnapshot,
        );
      }

      invoice.addDetail(detail);
    }

    return invoice;
  }

  static toPersistence(entity: Invoice): {
    CLIENT_ID: number;
    USER_ID: number | undefined;
    ISSUE_DATE: Date;
    SUBTOTAL_SNAPSHOT: number;
    TAX_TOTAL_SNAPSHOT: number;
    TOTAL_SNAPSHOT: number;
    TRANSACTION_ID: string;
    STATUS: string;
    PAYMENT_METHOD: string;
    IS_ACTIVE: number;
  } {
    return {
      CLIENT_ID: entity.clientId,
      USER_ID: entity.userId ?? undefined,
      ISSUE_DATE: entity.issueDate ?? new Date(),
      // Use getters directly - they calculate from details if _snapshots not set
      SUBTOTAL_SNAPSHOT: entity.subtotalSnapshot,
      TAX_TOTAL_SNAPSHOT: entity.taxTotalSnapshot,
      TOTAL_SNAPSHOT: entity.totalSnapshot,
      TRANSACTION_ID: entity.transactionId ?? '',
      STATUS: entity.status ?? 'CONFIRMED',
      PAYMENT_METHOD: entity.paymentMethod ?? 'CASH',
      IS_ACTIVE: 1,
    };
  }
}
