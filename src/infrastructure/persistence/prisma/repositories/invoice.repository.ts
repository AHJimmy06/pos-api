import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IInvoiceRepository } from '../../../../domain/repositories/invoice.repository.interface';
import { Invoice as InvoiceEntity } from '../../../../domain/entities/invoice.entity';
import { InvoiceMapper } from '../mappers/invoice.mapper';

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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return invoices.map((invoice) => InvoiceMapper.toEntity(invoice as any));
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
      data: invoices.map((invoice) => InvoiceMapper.toEntity(invoice as any)),
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const persistenceData: any = InvoiceMapper.toPersistence(invoice);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    delete persistenceData.id;

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
