import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IInvoiceRepository } from '../../../../domain/repositories/invoice.repository.interface';
import { Invoice as InvoiceEntity } from '../../../../domain/entities/invoice.entity';
import {
  InvoiceMapper,
  PrismaInvoiceWithRelations,
} from '../mappers/invoice.mapper';
import { Prisma } from '@prisma/client';

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
            product: true,
          },
        },
      },
      orderBy: { issueDate: 'desc' },
    });
    return invoices.map((invoice) =>
      InvoiceMapper.toEntity(invoice as PrismaInvoiceWithRelations),
    );
  }

  async findAllPaginated(
    page: number,
    limit: number,
    searchId?: number,
  ): Promise<{ data: InvoiceEntity[]; total: number }> {
    const where = searchId ? { id: searchId } : {};
    const [invoices, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        include: {
          details: {
            include: {
              detailTaxes: true,
              product: true,
            },
          },
        },
        orderBy: { issueDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return {
      data: invoices.map((invoice) =>
        InvoiceMapper.toEntity(invoice as PrismaInvoiceWithRelations),
      ),
      total,
    };
  }

  async findById(id: number): Promise<InvoiceEntity | null> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        details: {
          include: {
            detailTaxes: true,
            product: true,
          },
        },
      },
    });

    return invoice ? InvoiceMapper.toEntity(invoice) : null;
  }

  async create(invoice: InvoiceEntity): Promise<InvoiceEntity> {
    const persistenceData = InvoiceMapper.toPersistence(
      invoice,
    ) as unknown as Prisma.InvoiceCreateInput;

    const createdInvoice = await this.prisma.invoice.create({
      data: persistenceData,
      include: {
        details: {
          include: {
            detailTaxes: true,
            product: true,
          },
        },
      },
    });

    return InvoiceMapper.toEntity(createdInvoice);
  }
}
