import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaUnitOfWork } from '../prisma-unit-of-work';
import { ITaxRepository } from '../../../../domain/repositories/tax.repository.interface';
import { Tax as TaxEntity } from '../../../../domain/entities/tax.entity';
import { Prisma } from '@prisma/client';
import { TaxMapper } from '../mappers/tax.mapper';

@Injectable()
export class PrismaTaxRepository extends ITaxRepository {
  constructor(private readonly uow: PrismaUnitOfWork) {
    super();
  }

  private get prisma() {
    return this.uow.getClient();
  }

  async findAll(): Promise<TaxEntity[]> {
    const taxes = await this.prisma.tax.findMany({
      orderBy: { id: 'asc' },
    });
    return taxes.map((t) => TaxMapper.toEntity(t));
  }

  async findAllPaginated(
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ data: TaxEntity[]; total: number }> {
    const where: Prisma.TaxWhereInput = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [taxes, total] = await Promise.all([
      this.prisma.tax.findMany({
        where,
        orderBy: { id: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.tax.count({ where }),
    ]);

    return {
      data: taxes.map((t) => TaxMapper.toEntity(t)),
      total,
    };
  }

  async findById(id: number): Promise<TaxEntity | null> {
    const tax = await this.prisma.tax.findUnique({
      where: { id },
    });
    return tax ? TaxMapper.toEntity(tax) : null;
  }

  async create(tax: TaxEntity): Promise<TaxEntity> {
    const newTax = await this.prisma.tax.create({
      data: TaxMapper.toPersistence(tax),
    });
    return TaxMapper.toEntity(newTax);
  }

  async update(id: number, tax: Partial<TaxEntity>): Promise<TaxEntity> {
    try {
      const data: Prisma.TaxUpdateInput = {};
      if (tax.name !== undefined) data.name = tax.name;
      if (tax.currentRate !== undefined)
        data.currentRate = new Prisma.Decimal(tax.currentRate);

      const updatedTax = await this.prisma.tax.update({
        where: { id },
        data,
      });
      return TaxMapper.toEntity(updatedTax);
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Tax with ID ${id} not found`);
      }
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.prisma.tax.delete({
        where: { id },
      });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Tax with ID ${id} not found`);
      }
      throw error;
    }
  }
}
