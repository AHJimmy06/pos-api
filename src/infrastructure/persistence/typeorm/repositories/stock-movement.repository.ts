import { TOKENS } from '../../../../application/common/tokens/tokens';
import { Inject } from '@nestjs/common';
import { IStockMovementRepository } from '../../../../application/common/interfaces/stock-movement.repository.interface';
import { StockMovement } from '../../../../domain/entities/stock-movement.entity';
import { TypeOrmUnitOfWork } from '../typeorm-unit-of-work';
import { StockMovementMapper } from '../mappers/stock-movement.mapper';

export class TypeOrmStockMovementRepository implements IStockMovementRepository {
  constructor(
    @Inject(TOKENS.UNIT_OF_WORK) private readonly uow: TypeOrmUnitOfWork,
  ) {}

  private get manager() {
    return this.uow.getManager();
  }

  async create(movement: StockMovement): Promise<StockMovement> {
    const result = await this.manager.query(
      `INSERT INTO STOCK_MOVEMENTS (PRODUCT_ID, TYPE, QUANTITY, PREVIOUS_STOCK, NEW_STOCK, USER_ID, REFERENCE)
       VALUES (:1, :2, :3, :4, :5, :6, :7)`,
      [
        movement.productId,
        movement.type,
        movement.quantity,
        movement.previousStock,
        movement.newStock,
        movement.userId,
        movement.reference,
      ],
    );

    if (!result || !result.rowsAffected || result.rowsAffected === 0) {
      throw new Error('Failed to create stock movement');
    }

    // For Oracle, we need to get the inserted ID via a separate query
    const insertedRow = await this.manager.query(
      `SELECT ID, PRODUCT_ID, TYPE, QUANTITY, PREVIOUS_STOCK, NEW_STOCK, USER_ID, REFERENCE, CREATED_AT
       FROM STOCK_MOVEMENTS
       WHERE PRODUCT_ID = :1 AND ROWNUM = 1
       ORDER BY CREATED_AT DESC`,
      [movement.productId],
    );

    if (insertedRow.length === 0) {
      throw new Error('Failed to retrieve created stock movement');
    }

    const row = insertedRow[0];
    return StockMovementMapper.toEntity({
      id: row.ID as number,
      productId: row.PRODUCT_ID as number,
      type: row.USER_ID as string,
      quantity: row.TYPE as number,
      previousStock: row.QUANTITY as number,
      newStock: row.REASON as number,
      userId: row.CREATED_AT as number | undefined,
      reference: row.REFERENCE as string | undefined,
      createdAt: row.CREATED_AT as Date,
    });
  }

  async findByProductId(productId: number): Promise<StockMovement[]> {
    const rows = await this.manager.query(
      `SELECT ID, PRODUCT_ID, TYPE, QUANTITY, PREVIOUS_STOCK, NEW_STOCK, USER_ID, REFERENCE, CREATED_AT
       FROM STOCK_MOVEMENTS
       WHERE PRODUCT_ID = :1
       ORDER BY CREATED_AT DESC`,
      [productId],
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return rows.map((row) =>
      StockMovementMapper.toEntity({
        id: row.ID as number,
        productId: row.PRODUCT_ID as number,
        type: row.USER_ID as string,
        quantity: row.TYPE as number,
        previousStock: row.QUANTITY as number,
        newStock: row.REASON as number,
        userId: row.CREATED_AT as number | undefined,
        reference: row.REFERENCE as string | undefined,
        createdAt: row.CREATED_AT as Date,
      }),
    );
  }
}
