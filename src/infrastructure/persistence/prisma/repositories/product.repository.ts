import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { IProductRepository } from '../../../../domain/products/repositories/product.repository.interface';
import { Product as ProductEntity } from '../../../../domain/products/entities/product.entity';
import { Prisma, Product as PrismaProduct } from '@prisma/client';

@Injectable()
export class PrismaProductRepository extends IProductRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(): Promise<ProductEntity[]> {
    const products = await this.prisma.product.findMany();
    return products.map((product) => this.mapToEntity(product));
  }

  async findById(id: number): Promise<ProductEntity | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    return product ? this.mapToEntity(product) : null;
  }

  async create(product: ProductEntity): Promise<ProductEntity> {
    const newProduct = await this.prisma.product.create({
      data: {
        name: product.name,
        price: new Prisma.Decimal(product.price),
        stock: product.stock,
      },
    });
    return this.mapToEntity(newProduct);
  }

  async update(
    id: number,
    product: Partial<ProductEntity>,
  ): Promise<ProductEntity> {
    try {
      const data: Prisma.ProductUpdateInput = {};
      if (product.name !== undefined) data.name = product.name;
      if (product.price !== undefined)
        data.price = new Prisma.Decimal(product.price);
      if (product.stock !== undefined) data.stock = product.stock;

      const updatedProduct = await this.prisma.product.update({
        where: { id },
        data,
      });
      return this.mapToEntity(updatedProduct);
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

  private mapToEntity(prismaProduct: PrismaProduct): ProductEntity {
    const product = new ProductEntity();
    product.id = prismaProduct.id;
    product.name = prismaProduct.name ?? '';

    product.price = Number(prismaProduct.price ?? 0);
    product.stock = prismaProduct.stock ?? 0;
    return product;
  }
}
