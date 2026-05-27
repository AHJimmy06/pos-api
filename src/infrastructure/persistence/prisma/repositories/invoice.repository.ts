import { Injectable } from '@nestjs/common';
import { PrismaUnitOfWork } from '../prisma-unit-of-work';
import { IInvoiceRepository } from '../../../../application/common/interfaces/invoice.repository.interface';
import { Invoice as InvoiceEntity } from '../../../../domain/entities/invoice.entity';
import {
  InvoiceMapper,
  PrismaInvoiceWithRelations,
} from '../mappers/invoice.mapper';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaInvoiceRepository extends IInvoiceRepository {
  constructor(private readonly uow: PrismaUnitOfWork) {
    super();
  }

  private get prisma() {
    return this.uow.getClient();
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
    userId?: number,
    searchField?: string,
  ): Promise<{ data: InvoiceEntity[]; total: number }> {
    const where: Prisma.InvoiceWhereInput = {};
    if (searchId) where.id = searchId;
    if (userId) where.userId = userId;

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
    const persistenceData: any = InvoiceMapper.toPersistence(invoice);

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

  async findByIdWithDetails(id: number): Promise<InvoiceEntity | null> {
    // Alias for findById with full relations
    return this.findById(id);
  }

  async update(id: number, invoice: InvoiceEntity): Promise<InvoiceEntity> {
    const persistenceData: any = InvoiceMapper.toPersistenceUpdate(invoice);

    const updatedInvoice = await this.prisma.invoice.update({
      where: { id },
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

    return InvoiceMapper.toEntity(updatedInvoice);
  }
}
