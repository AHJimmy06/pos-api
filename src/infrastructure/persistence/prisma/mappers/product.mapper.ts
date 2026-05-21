import { Product as ProductEntity } from '../../../../domain/entities/product.entity';
import { Prisma } from '@prisma/client';

export class ProductMapper {
  static toEntity(prismaProduct: {
    id: number;
    name: string | null;
    price: Prisma.Decimal | number | null;
    stock: number | null;
    version: number;
    isActive: boolean;
    productTaxes?: { taxId: number }[];
  }): ProductEntity {
    const priceVal = prismaProduct.price
      ? Number(prismaProduct.price.toString())
      : 0;
    const entity = new ProductEntity(
      prismaProduct.name || '',
      priceVal,
      prismaProduct.stock || 0,
    );
    entity.id = prismaProduct.id;
    entity.version = prismaProduct.version ?? 0;
    entity.isActive = prismaProduct.isActive;
    entity.taxIds = prismaProduct.productTaxes?.map((pt) => pt.taxId) || [];
    return entity;
  }

  static toPersistence(entity: ProductEntity) {
    return {
      name: entity.name,
      price: new Prisma.Decimal(entity.price),
      stock: entity.stock,
      isActive: entity.isActive,
      productTaxes:
        entity.taxIds.length > 0
          ? {
              create: entity.taxIds.map((tid) => ({
                tax: { connect: { id: tid } },
              })),
            }
          : undefined,
    };
  }
}
