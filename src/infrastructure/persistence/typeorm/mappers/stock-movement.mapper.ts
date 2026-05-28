import { StockMovement } from '../../../../domain/entities/stock-movement.entity';
import { MovementType } from '../../../../domain/enums/movement-type.enum';

export interface RawStockMovementRow {
  id: number;
  productId: number;
  type: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  userId?: number;
  reference?: string;
  createdAt: Date;
}

export class StockMovementMapper {
  static toEntity(raw: RawStockMovementRow): StockMovement {
    const entity = new StockMovement({
      productId: raw.productId,
      type: raw.type as MovementType,
      quantity: raw.quantity,
      previousStock: raw.previousStock,
      newStock: raw.newStock,
      userId: raw.userId,
      reference: raw.reference,
    });
    entity.id = raw.id;
    entity.createdAt = raw.createdAt;
    return entity;
  }

  static toPersistence(entity: StockMovement): Record<string, unknown> {
    return {
      PRODUCT_ID: entity.productId,
      TYPE: entity.type,
      QUANTITY: entity.quantity,
      PREVIOUS_STOCK: entity.previousStock,
      NEW_STOCK: entity.newStock,
      USER_ID: entity.userId,
      REFERENCE: entity.reference,
    };
  }
}
