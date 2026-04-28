import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IProductRepository } from '../../../../domain/repositories/product.repository.interface';
import { Product as ProductEntity } from '../../../../domain/entities/product.entity';
import { Prisma } from '@prisma/client';
import { ProductMapper } from '../mappers/product.mapper';

@Injectable()
export class PrismaProductRepository extends IProductRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(): Promise<ProductEntity[]> {
    const products = await this.prisma.product.findMany({
      include: { productTaxes: { include: { tax: true } } },
    });
    return products.map((product) => ProductMapper.toEntity(product));
  }

  async findById(id: number): Promise<ProductEntity | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { productTaxes: { include: { tax: true } } },
    });
    return product ? ProductMapper.toEntity(product) : null;
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

  async delete(id: number): Promise<void> {
    try {
      await this.prisma.product.delete({
        where: { id },
      });
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
}
