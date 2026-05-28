import { Tax } from '../../../../domain/entities/tax.entity';

export interface RawTaxRow {
  id: number;
  name?: string;
  currentRate: number;
}

export class TaxMapper {
  static toEntity(raw: RawTaxRow): Tax {
    const entity = new Tax(raw.name || '', Number(raw.currentRate));
    entity.id = raw.id;
    return entity;
  }

  static toPersistence(entity: Tax): Record<string, unknown> {
    return {
      NAME: entity.name,
      CURRENT_RATE: entity.currentRate,
    };
  }
}
