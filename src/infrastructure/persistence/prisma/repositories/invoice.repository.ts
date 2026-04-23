import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IInvoiceRepository } from '../../../../domain/invoices/repositories/invoice.repository.interface';
import { Invoice as InvoiceEntity } from '../../../../domain/invoices/entities/invoice.entity';
import { InvoiceDetail as InvoiceDetailEntity } from '../../../../domain/invoices/entities/invoice-detail.entity';
import { InvoiceDetailTax as InvoiceDetailTaxEntity } from '../../../../domain/invoices/entities/invoice-detail-tax.entity';
import {
  Invoice as PrismaInvoice,
  InvoiceDetail as PrismaInvoiceDetail,
  InvoiceDetailTax as PrismaInvoiceDetailTax,
} from '@prisma/client';

type PrismaInvoiceWithRelations = PrismaInvoice & {
  details: (PrismaInvoiceDetail & {
    detailTaxes: PrismaInvoiceDetailTax[];
  })[];
};

@Injectable()
export class PrismaInvoiceRepository extends IInvoiceRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(): Promise<InvoiceEntity[]> {
    const invoices = await this.prisma.invoice.findMany({
      include: {
        details: {
          include: {
            detailTaxes: true,
          },
        },
      },
    });
    return invoices.map((invoice) => this.mapToEntity(invoice));
  }

  async findById(id: number): Promise<InvoiceEntity | null> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        details: {
          include: {
            detailTaxes: true,
          },
        },
      },
    });
    return invoice ? this.mapToEntity(invoice) : null;
  }

  async create(invoice: InvoiceEntity): Promise<InvoiceEntity> {
    const createdInvoice = await this.prisma.$transaction(async (tx) => {
      return await tx.invoice.create({
        data: {
          clientId: invoice.clientId,
          subtotalSnapshot: invoice.subtotalSnapshot,
          taxTotalSnapshot: invoice.taxTotalSnapshot,
          totalSnapshot: invoice.totalSnapshot,
          transactionId: invoice.transactionId,
          details: {
            create: invoice.details.map((detail) => ({
              productId: detail.productId,
              quantity: detail.quantity,
              unitPriceSnapshot: detail.unitPriceSnapshot,
              detailTaxes: {
                create: (detail.detailTaxes || []).map((tax) => ({
                  taxId: tax.taxId,
                  rateSnapshot: tax.rateSnapshot,
                  calculatedAmountSnapshot: tax.calculatedAmountSnapshot,
                })),
              },
            })),
          },
        },
        include: {
          details: {
            include: {
              detailTaxes: true,
            },
          },
        },
      });
    });
    return this.mapToEntity(createdInvoice);
  }

  private mapToEntity(
    prismaInvoice: PrismaInvoiceWithRelations,
  ): InvoiceEntity {
    const invoice = new InvoiceEntity();
    invoice.id = prismaInvoice.id;
    invoice.clientId = prismaInvoice.clientId ?? 0;
    invoice.issueDate = prismaInvoice.issueDate ?? undefined;
    invoice.subtotalSnapshot = Number(prismaInvoice.subtotalSnapshot ?? 0);
    invoice.taxTotalSnapshot = Number(prismaInvoice.taxTotalSnapshot ?? 0);
    invoice.totalSnapshot = Number(prismaInvoice.totalSnapshot ?? 0);
    invoice.transactionId = prismaInvoice.transactionId ?? '';
    invoice.details = prismaInvoice.details.map((prismaDetail) => {
      const detail = new InvoiceDetailEntity();
      detail.id = prismaDetail.id;
      detail.invoiceId = prismaDetail.invoiceId ?? 0;
      detail.productId = prismaDetail.productId ?? 0;
      detail.quantity = prismaDetail.quantity ?? 0;
      detail.unitPriceSnapshot = Number(
        prismaDetail.unitPriceSnapshot ?? 0,
      );
      detail.detailTaxes = prismaDetail.detailTaxes.map((prismaTax) => {
        const detailTax = new InvoiceDetailTaxEntity();
        detailTax.id = prismaTax.id;
        detailTax.detailId = prismaTax.detailId ?? 0;
        detailTax.taxId = prismaTax.taxId ?? 0;
        detailTax.rateSnapshot = Number(prismaTax.rateSnapshot ?? 0);
        detailTax.calculatedAmountSnapshot = Number(
          prismaTax.calculatedAmountSnapshot ?? 0,
        );
        return detailTax;
      });
      return detail;
    });
    return invoice;
  }
}
