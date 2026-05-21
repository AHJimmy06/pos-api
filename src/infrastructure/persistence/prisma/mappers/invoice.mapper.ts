import { Invoice as InvoiceEntity } from '../../../../domain/entities/invoice.entity';
import { InvoiceDetail as InvoiceDetailEntity } from '../../../../domain/entities/invoice-detail.entity';
import {
  Invoice as PrismaInvoice,
  InvoiceDetail as PrismaInvoiceDetail,
  InvoiceDetailTax as PrismaInvoiceDetailTax,
  InvoiceStatus as PrismaInvoiceStatus,
  PaymentMethod as PrismaPaymentMethod,
} from '@prisma/client';
import { InvoiceStatus } from '../../../../domain/enums/invoice-status.enum';
import { PaymentMethod } from '../../../../domain/enums/payment-method.enum';

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
    // Sobrescribimos los valores generados por el constructor con los de la base de datos
    (invoice as { issueDate: Date }).issueDate =
      prismaInvoice.issueDate || new Date();
    (invoice as { transactionId: string }).transactionId =
      prismaInvoice.transactionId || '';
    invoice.status = prismaInvoice.status as InvoiceStatus;
    invoice.paymentMethod = prismaInvoice.paymentMethod as PaymentMethod;
    invoice.isActive = prismaInvoice.isActive ?? true;
    invoice.version = prismaInvoice.version ?? 0;

    // Set stored snapshots if available
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

      // Set product name - prefer denormalized snapshot, fallback to relation
      detail.productName =
        prismaDetail.productName || prismaDetail.product?.name || '';

      prismaDetail.detailTaxes.forEach((prismaTax) => {
        detail.addTax(
          prismaTax.taxId || 0,
          Number(prismaTax.rateSnapshot || 0),
        );
        // Ajustamos el ID y el monto calculado si difiere por redondeo
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

  static toPersistence(entity: InvoiceEntity) {
    const data: any = {
      clientId: entity.clientId,
      userId: entity.userId || null,
      subtotalSnapshot: entity.subtotalSnapshot,
      taxTotalSnapshot: entity.taxTotalSnapshot,
      totalSnapshot: entity.totalSnapshot,
      transactionId: entity.transactionId,
      issueDate: entity.issueDate,
      status: entity.status as unknown as PrismaInvoiceStatus,
      paymentMethod: entity.paymentMethod as any,
      isActive: entity.isActive,
      version: entity.version,
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return data;
  }

  static toPersistenceUpdate(entity: InvoiceEntity) {
    const data: any = {
      clientId: entity.clientId,
      subtotalSnapshot: entity.subtotalSnapshot,
      taxTotalSnapshot: entity.taxTotalSnapshot,
      totalSnapshot: entity.totalSnapshot,
      status: entity.status as unknown as PrismaInvoiceStatus,
      isActive: entity.isActive,
      version: { increment: 1 },
      // Delete existing details and recreate
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return data;
  }
}
