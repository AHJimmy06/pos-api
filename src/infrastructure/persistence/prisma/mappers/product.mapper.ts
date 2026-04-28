import { Product as ProductEntity } from '../../../../domain/entities/product.entity';
import { Prisma } from '@prisma/client';

export class ProductMapper {
  static toEntity(prismaProduct: any): ProductEntity {
    const entity = new ProductEntity(
      prismaProduct.name || '',
      Number(prismaProduct.price || 0),
      prismaProduct.stock || 0,
    );
    entity.id = prismaProduct.id;
    entity.version = prismaProduct.version ?? 0;
    entity.taxIds =
      prismaProduct.productTaxes?.map((pt: any) => pt.taxId) || [];
    return entity;
  }

  static toPersistence(entity: ProductEntity): any {
    return {
      name: entity.name,
      price: new Prisma.Decimal(entity.price),
      stock: entity.stock,
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
