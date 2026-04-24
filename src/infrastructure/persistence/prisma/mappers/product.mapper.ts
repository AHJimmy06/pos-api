import { Product as ProductEntity } from '../../../../domain/entities/product.entity';
import { Product as PrismaProduct } from '@prisma/client';
import { Prisma } from '@prisma/client';

export class ProductMapper {
  static toEntity(prismaProduct: PrismaProduct): ProductEntity {
    const entity = new ProductEntity(
      prismaProduct.name || '',
      Number(prismaProduct.price || 0),
      prismaProduct.stock || 0,
    );
    entity.id = prismaProduct.id;
    return entity;
  }

  static toPersistence(entity: ProductEntity): any {
    return {
      name: entity.name,
      price: new Prisma.Decimal(entity.price),
      stock: entity.stock,
    };
  }
}
