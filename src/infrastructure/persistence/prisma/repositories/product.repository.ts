import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaUnitOfWork } from '../prisma-unit-of-work';
import { IProductRepository } from '../../../../application/common/interfaces/product.repository.interface';
import { Product as ProductEntity } from '../../../../domain/entities/product.entity';
import { Prisma } from '@prisma/client';
import { ProductMapper } from '../mappers/product.mapper';
import { DeleteResult } from '../../../../domain/common/delete-result.interface';

@Injectable()
export class PrismaProductRepository extends IProductRepository {
  constructor(private readonly uow: PrismaUnitOfWork) {
    super();
  }

  private get prisma() {
    return this.uow.getClient();
  }

  async findAll(): Promise<ProductEntity[]> {
    const products = await this.prisma.product.findMany({
      where: { isActive: true },
      orderBy: { id: 'asc' },
      include: { productTaxes: { include: { tax: true } } },
    });
    return products.map((product) => ProductMapper.toEntity(product));
  }

  async findForSale(
    page: number,
    limit: number,
    search?: string,
    searchField: string = 'all',
  ): Promise<{ data: ProductEntity[]; total: number }> {
    // Only products that are active AND have stock > 0
    const where: Prisma.ProductWhereInput = {
      isActive: true,
      stock: { gt: 0 },
    };
    if (search) {
      const searchNum = parseInt(search, 10);
      const isNumericSearch = !isNaN(searchNum);

      if (searchField === 'id' && isNumericSearch) {
        where.id = searchNum;
      } else if (searchField === 'name') {
        where.name = { contains: search, mode: 'insensitive' };
      } else if (searchField === 'price' && isNumericSearch) {
        where.price = { equals: new Prisma.Decimal(searchNum) };
      } else if (searchField === 'stock' && isNumericSearch) {
        where.stock = { equals: searchNum };
      } else {
        // Búsqueda por todos los campos (all)
        const orConditions: Prisma.ProductWhereInput[] = [
          { name: { contains: search, mode: 'insensitive' } },
        ];
        if (isNumericSearch) {
          orConditions.push({ id: searchNum });
          orConditions.push({ stock: searchNum });
        }
        where.OR = orConditions;
      }
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { productTaxes: { include: { tax: true } } },
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products.map((product) => ProductMapper.toEntity(product)),
      total,
    };
  }

  async findAllPaginated(
    page: number,
    limit: number,
    search?: string,
    searchField: string = 'all',
  ): Promise<{ data: ProductEntity[]; total: number }> {
    const where: Prisma.ProductWhereInput = { isActive: true };
    if (search) {
      const searchNum = parseInt(search, 10);
      const isNumericSearch = !isNaN(searchNum);

      if (searchField === 'id' && isNumericSearch) {
        where.id = searchNum;
      } else if (searchField === 'name') {
        where.name = { contains: search, mode: 'insensitive' };
      } else if (searchField === 'price' && isNumericSearch) {
        where.price = { equals: new Prisma.Decimal(searchNum) };
      } else if (searchField === 'stock' && isNumericSearch) {
        where.stock = { equals: searchNum };
      } else {
        // Búsqueda por todos los campos
        const orConditions: Prisma.ProductWhereInput[] = [];
        if (isNumericSearch) {
          orConditions.push({ id: searchNum });
          orConditions.push({ stock: searchNum });
          orConditions.push({ price: { gte: new Prisma.Decimal(searchNum * 0.9), lte: new Prisma.Decimal(searchNum * 1.1) } });
        }
        orConditions.push({ name: { contains: search, mode: 'insensitive' } });
        where.OR = orConditions;
      }
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { productTaxes: { include: { tax: true } } },
        orderBy: { id: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products.map((product) => ProductMapper.toEntity(product)),
      total,
    };
  }

  async findById(id: number): Promise<ProductEntity | null> {
    const product = await this.prisma.product.findFirst({
      where: { id, isActive: true },
      include: { productTaxes: { include: { tax: true } } },
    });
    return product ? ProductMapper.toEntity(product) : null;
  }

  async findByIds(ids: number[]): Promise<ProductEntity[]> {
    if (ids.length === 0) return [];
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: ids },
        isActive: true,
      },
      include: { productTaxes: { include: { tax: true } } },
    });
    return products.map((product) => ProductMapper.toEntity(product));
  }

  async create(product: ProductEntity): Promise<ProductEntity> {
    const data: Prisma.ProductCreateInput = {
      name: product.name,
      price: new Prisma.Decimal(product.price),
      stock: product.stock,
    };

    if (product.taxIds.length > 0) {
      data.productTaxes = {
        create: product.taxIds.map((tid) => ({
          tax: { connect: { id: tid } },
        })),
      };
    }

    const newProduct = await this.prisma.product.create({ data });
    return ProductMapper.toEntity(newProduct);
  }

  async update(
    id: number,
    product: Partial<ProductEntity>,
  ): Promise<ProductEntity> {
    try {
      // First get current product with relations
      const current = await this.prisma.product.findUnique({
        where: { id },
        include: { productTaxes: true },
      });

      if (!current) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      const data: Prisma.ProductUpdateInput = {};
      if (product.name !== undefined) data.name = product.name;
      if (product.price !== undefined)
        data.price = new Prisma.Decimal(product.price);
      if (product.stock !== undefined) data.stock = product.stock;

      // Handle tax relations update if provided
      if (product.taxIds !== undefined) {
        // Delete existing relations
        if (current.productTaxes.length > 0) {
          await this.prisma.productTax.deleteMany({
            where: { productId: id },
          });
        }
        // Create new relations
        if (product.taxIds.length > 0) {
          data.productTaxes = {
            create: product.taxIds.map((tid) => ({
              tax: { connect: { id: tid } },
            })),
          };
        }
      }

      const updatedProduct = await this.prisma.product.update({
        where: { id },
        data,
        include: { productTaxes: { include: { tax: true } } },
      });
      return ProductMapper.toEntity(updatedProduct);
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      throw error;
    }
  }

  async delete(id: number): Promise<DeleteResult> {
    try {
      // Check for associated invoice details or stock movements
      const [invoiceDetailCount, stockMovementCount] = await Promise.all([
        this.prisma.invoiceDetail.count({ where: { productId: id } }),
        this.prisma.stockMovement.count({ where: { productId: id } }),
      ]);

      if (invoiceDetailCount > 0 || stockMovementCount > 0) {
        // Soft delete if associations exist
        await this.prisma.product.update({
          where: { id },
          data: { isActive: false },
        });
        return {
          id,
          deleteType: 'soft',
          message: `Product ${id} has sales history. Marked as inactive.`,
        };
      } else {
        // Physical delete if no associations exist
        await this.prisma.productTax.deleteMany({
          where: { productId: id },
        });
        await this.prisma.product.delete({
          where: { id },
        });
        return {
          id,
          deleteType: 'physical',
          message: `Product ${id} permanently deleted.`,
        };
      }
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      throw error;
    }
  }

  async reduceStock(params: {
    productId: number;
    quantity: number;
    expectedVersion: number;
  }): Promise<boolean> {
    const result = await this.prisma.product.updateMany({
      where: {
        id: params.productId,
        version: params.expectedVersion,
        stock: { gte: params.quantity },
      },
      data: {
        stock: { decrement: params.quantity },
        version: { increment: 1 },
      },
    });

    return result.count > 0;
  }

  async addStock(params: {
    productId: number;
    quantity: number;
    expectedVersion: number;
  }): Promise<boolean> {
    const result = await this.prisma.product.updateMany({
      where: {
        id: params.productId,
        version: params.expectedVersion,
      },
      data: {
        stock: { increment: params.quantity },
        version: { increment: 1 },
      },
    });

    return result.count > 0;
  }
}
