import { Tax as TaxEntity } from '../../../../domain/entities/tax.entity';
import { Tax as PrismaTax } from '@prisma/client';
import { Prisma } from '@prisma/client';

export class TaxMapper {
  static toEntity(prismaTax: PrismaTax): TaxEntity {
    const entity = new TaxEntity(
      prismaTax.name || '',
      Number(prismaTax.currentRate || 0),
    );
    entity.id = prismaTax.id;
    return entity;
  }

  static toPersistence(entity: TaxEntity) {
    return {
      name: entity.name,
      currentRate: new Prisma.Decimal(entity.currentRate),
    };
  }
}
