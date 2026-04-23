import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ITaxRepository } from '../../../../domain/taxes/repositories/tax.repository.interface';
import { Tax as TaxEntity } from '../../../../domain/taxes/entities/tax.entity';
import { Prisma, Tax as PrismaTax } from '@prisma/client';

@Injectable()
export class PrismaTaxRepository extends ITaxRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(): Promise<TaxEntity[]> {
    const taxes = await this.prisma.tax.findMany();
    return taxes.map((tax) => this.mapToEntity(tax));
  }

  async findById(id: number): Promise<TaxEntity | null> {
    const tax = await this.prisma.tax.findUnique({
      where: { id },
    });
    return tax ? this.mapToEntity(tax) : null;
  }

  async create(tax: TaxEntity): Promise<TaxEntity> {
    const newTax = await this.prisma.tax.create({
      data: {
        name: tax.name,
        currentRate: new Prisma.Decimal(tax.currentRate),
      },
    });
    return this.mapToEntity(newTax);
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
      return this.mapToEntity(updatedTax);
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

  private mapToEntity(prismaTax: PrismaTax): TaxEntity {
    const tax = new TaxEntity();
    tax.id = prismaTax.id;
    tax.name = prismaTax.name ?? '';

    tax.currentRate = Number(prismaTax.currentRate ?? 0);
    return tax;
  }
}
