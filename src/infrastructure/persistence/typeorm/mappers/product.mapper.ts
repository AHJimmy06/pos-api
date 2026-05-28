import { Product } from '../../../../domain/entities/product.entity';

export class ProductMapper {
  static toEntity(raw: {
    id: number;
    name?: string;
    price: number;
    stock?: number;
    version: number;
    isActive: number;
    taxIds?: number[];
  }): Product {
    const product = new Product(
      raw.name || '',
      Number(raw.price),
      raw.stock || 0,
    );
    product.id = raw.id;
    product.version = raw.version;
    product.isActive = raw.isActive === 1;
    if (raw.taxIds && raw.taxIds.length > 0) {
      product.taxIds = raw.taxIds;
    }
    return product;
  }

  static toPersistence(entity: Product): {
    NAME: string | undefined;
    PRICE: number;
    STOCK: number;
    IS_ACTIVE: number;
  } {
    return {
      NAME: entity.name,
      PRICE: entity.price,
      STOCK: entity.stock,
      IS_ACTIVE: entity.isActive ? 1 : 0,
    };
  }
}
