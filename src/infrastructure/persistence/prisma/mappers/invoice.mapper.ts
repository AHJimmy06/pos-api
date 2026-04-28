import { Invoice as InvoiceEntity } from '../../../../domain/entities/invoice.entity';
import { InvoiceDetail as InvoiceDetailEntity } from '../../../../domain/entities/invoice-detail.entity';
import {
  Invoice as PrismaInvoice,
  InvoiceDetail as PrismaInvoiceDetail,
  InvoiceDetailTax as PrismaInvoiceDetailTax,
} from '@prisma/client';

type PrismaInvoiceWithRelations = PrismaInvoice & {
  details: (PrismaInvoiceDetail & {
    detailTaxes: PrismaInvoiceDetailTax[];
    product: { name: string | null } | null;
  })[];
};

export class InvoiceMapper {
  static toEntity(prismaInvoice: PrismaInvoiceWithRelations): InvoiceEntity {
    const invoice = new InvoiceEntity(prismaInvoice.clientId || 0);
    invoice.id = prismaInvoice.id;
    // Sobrescribimos los valores generados por el constructor con los de la base de datos
    (invoice as { issueDate: Date }).issueDate =
      prismaInvoice.issueDate || new Date();
    (invoice as { transactionId: string }).transactionId =
      prismaInvoice.transactionId || '';

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

  static toPersistence(entity: InvoiceEntity): any {
    return {
      clientId: entity.clientId,
      subtotalSnapshot: entity.subtotalSnapshot,
      taxTotalSnapshot: entity.taxTotalSnapshot,
      totalSnapshot: entity.totalSnapshot,
      transactionId: entity.transactionId,
      issueDate: entity.issueDate,
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
}
