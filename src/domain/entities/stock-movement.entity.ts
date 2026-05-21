import { MovementType } from '../enums/movement-type.enum';

export class StockMovement {
  id?: number;
  productId: number;
  type: MovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  userId?: number;
  reference?: string;
  createdAt: Date;

  constructor(params: {
    productId: number;
    type: MovementType;
    quantity: number;
    previousStock: number;
    newStock: number;
    userId?: number;
    reference?: string;
  }) {
    this.productId = params.productId;
    this.type = params.type;
    this.quantity = params.quantity;
    this.previousStock = params.previousStock;
    this.newStock = params.newStock;
    this.userId = params.userId;
    this.reference = params.reference;
    this.createdAt = new Date();
  }
}
