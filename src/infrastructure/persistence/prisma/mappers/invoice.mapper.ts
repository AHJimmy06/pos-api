import { Invoice as InvoiceEntity } from '../../../../domain/entities/invoice.entity';
import { InvoiceDetail as InvoiceDetailEntity } from '../../../../domain/entities/invoice-detail.entity';
import {
  Invoice as PrismaInvoice,
  InvoiceDetail as PrismaInvoiceDetail,
  InvoiceDetailTax as PrismaInvoiceDetailTax,
  InvoiceStatus as PrismaInvoiceStatus,
} from '@prisma/client';
import { InvoiceStatus } from '../../../../domain/enums/invoice-status.enum';
import { PaymentMethod } from '../../../../domain/enums/payment-method.enum';

/**
 * Shape de los snapshots serializados como JSON en `client_snapshot`
 * y `seller_snapshot` de la tabla `invoices`. Solo se leen `name` y `email`
 * en este mapper; si en el futuro se necesitan más campos, se agregan acá.
 */
interface InvoicePartySnapshot {
  name?: string;
  email?: string;
}

export type PrismaInvoiceWithRelations = PrismaInvoice & {
  details: (PrismaInvoiceDetail & {
    detailTaxes: PrismaInvoiceDetailTax[];
    product: { name: string | null } | null;
  })[];
};

export class InvoiceMapper {
  static toEntity(prismaInvoice: PrismaInvoiceWithRelations): InvoiceEntity {
    const invoice = new InvoiceEntity(prismaInvoice.clientId || 0);
    invoice.id = prismaInvoice.id;
    invoice.userId = prismaInvoice.userId || undefined;
    (invoice as { issueDate: Date }).issueDate =
      prismaInvoice.issueDate || new Date();
    (invoice as { transactionId: string }).transactionId =
      prismaInvoice.transactionId || '';
    invoice.status = prismaInvoice.status as InvoiceStatus;
    invoice.paymentMethod = prismaInvoice.paymentMethod as PaymentMethod;
    invoice.isActive = prismaInvoice.isActive ?? true;
    invoice.version = prismaInvoice.version ?? 0;
    // 1. Extraemos los campos JSON con su shape conocido (InvoicePartySnapshot).
    const clientSnapshot =
      prismaInvoice.client_snapshot as InvoicePartySnapshot | null;
    const sellerSnapshot =
      prismaInvoice.seller_snapshot as InvoicePartySnapshot | null;

    // 2. Mapeamos las propiedades leyendo DENTRO de los objetos JSON
    invoice.clientNameSnapshot = clientSnapshot?.name || undefined;
    invoice.clientEmailSnapshot = clientSnapshot?.email || undefined;
    invoice.sellerNameSnapshot = sellerSnapshot?.name || undefined;

    if (
      prismaInvoice.subtotalSnapshot !== null &&
      prismaInvoice.subtotalSnapshot !== undefined
    ) {
      invoice.setSnapshots(
        Number(prismaInvoice.subtotalSnapshot),
        Number(prismaInvoice.taxTotalSnapshot || 0),
        Number(prismaInvoice.totalSnapshot || 0),
      );
    }

    prismaInvoice.details.forEach((prismaDetail) => {
      const detail = new InvoiceDetailEntity(
        prismaDetail.productId || 0,
        prismaDetail.quantity || 0,
        Number(prismaDetail.unitPriceSnapshot || 0),
      );
      detail.id = prismaDetail.id;
      detail.invoiceId = prismaDetail.invoiceId || undefined;
      detail.productName =
        prismaDetail.productName || prismaDetail.product?.name || '';

      prismaDetail.detailTaxes.forEach((prismaTax) => {
        detail.addTax(
          prismaTax.taxId || 0,
          Number(prismaTax.rateSnapshot || 0),
        );
        const lastTax = detail.detailTaxes[detail.detailTaxes.length - 1];
        lastTax.id = prismaTax.id;
        lastTax.calculatedAmountSnapshot = Number(
          prismaTax.calculatedAmountSnapshot || 0,
        );
      });

      invoice.addDetail(detail);
    });

    return invoice;
  }

  static toPersistence(entity: InvoiceEntity): any {
    return {
      clientId: entity.clientId,
      userId: entity.userId || null,
      subtotalSnapshot: entity.subtotalSnapshot,
      taxTotalSnapshot: entity.taxTotalSnapshot,
      totalSnapshot: entity.totalSnapshot,
      transactionId: entity.transactionId,
      issueDate: entity.issueDate,
      status: entity.status as unknown as PrismaInvoiceStatus,
      paymentMethod: entity.paymentMethod,
      isActive: entity.isActive,
      version: entity.version,
      clientNameSnapshot: entity.clientNameSnapshot || null,
      clientEmailSnapshot: entity.clientEmailSnapshot || null,
      sellerNameSnapshot: entity.sellerNameSnapshot || null,
      details: {
        create: entity.details.map((detail) => ({
          productId: detail.productId,
          productName: detail.productName || null,
          quantity: detail.quantity,
          unitPriceSnapshot: detail.unitPriceSnapshot,
          detailTaxes: {
            create: detail.detailTaxes.map((tax) => ({
              taxId: tax.taxId,
              rateSnapshot: tax.rateSnapshot,
              calculatedAmountSnapshot: tax.calculatedAmountSnapshot,
            })),
          },
        })),
      },
    };
  }

  static toPersistenceUpdate(entity: InvoiceEntity): any {
    return {
      subtotalSnapshot: entity.subtotalSnapshot,
      taxTotalSnapshot: entity.taxTotalSnapshot,
      totalSnapshot: entity.totalSnapshot,
      status: entity.status as unknown as PrismaInvoiceStatus,
      isActive: entity.isActive,
      version: { increment: 1 },
      details: {
        deleteMany: { invoiceId: entity.id },
        create: entity.details.map((detail) => ({
          productId: detail.productId,
          productName: detail.productName || null,
          quantity: detail.quantity,
          unitPriceSnapshot: detail.unitPriceSnapshot,
          detailTaxes: {
            create: detail.detailTaxes.map((tax) => ({
              taxId: tax.taxId,
              rateSnapshot: tax.rateSnapshot,
              calculatedAmountSnapshot: tax.calculatedAmountSnapshot,
            })),
          },
        })),
      },
    };
  }
}
