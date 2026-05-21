import { StockMovement as StockMovementEntity } from '../../../../domain/entities/stock-movement.entity';
import { StockMovement } from '@prisma/client';
import { MovementType } from '../../../../domain/enums/movement-type.enum';

export class StockMovementMapper {
  static toEntity(prismaMovement: StockMovement): StockMovementEntity {
    const entity = new StockMovementEntity({
      productId: prismaMovement.productId,
      type: prismaMovement.type as MovementType,
      quantity: prismaMovement.quantity,
      previousStock: prismaMovement.previousStock,
      newStock: prismaMovement.newStock,
      userId: prismaMovement.userId || undefined,
      reference: prismaMovement.reference || undefined,
    });
    entity.id = prismaMovement.id;
    entity.createdAt = prismaMovement.createdAt;
    return entity;
  }

  static toPersistence(entity: StockMovementEntity) {
    return {
      productId: entity.productId,
      type: entity.type,
      quantity: entity.quantity,
      previousStock: entity.previousStock,
      newStock: entity.newStock,
      userId: entity.userId,
      reference: entity.reference,
      createdAt: entity.createdAt,
    };
  }
}
