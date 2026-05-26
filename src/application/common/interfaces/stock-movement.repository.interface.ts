import { StockMovement } from '../../../domain/entities/stock-movement.entity';

export abstract class IStockMovementRepository {
  abstract create(movement: StockMovement): Promise<StockMovement>;
  abstract findByProductId(productId: number): Promise<StockMovement[]>;
}
