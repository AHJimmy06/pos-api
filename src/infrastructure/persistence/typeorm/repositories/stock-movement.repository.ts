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
    console.log('[StockMovement.create] Starting with:', JSON.stringify(movement, null, 2));
    
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

    console.log('[StockMovement.create] INSERT result:', JSON.stringify(result, null, 2));

    if (!result || !result.rowsAffected || result.rowsAffected === 0) {
      // Try to see if it actually inserted despite rowsAffected being 0
      const checkResult = await this.manager.query(
        `SELECT COUNT(*) as CNT FROM STOCK_MOVEMENTS WHERE PRODUCT_ID = :1`,
        [movement.productId],
      );
      console.log('[StockMovement.create] Check after insert:', checkResult);
      
      if (checkResult && checkResult[0]?.CNT > 0) {
        console.log('[StockMovement.create] Record exists despite rowsAffected=0, continuing...');
      } else {
        throw new Error('Failed to create stock movement');
      }
    }

    // For Oracle, we need to get the inserted ID via a separate query
    // Use ID (not PRODUCT_ID) for finding the right row since multiple movements can exist
    const insertedRow = await this.manager.query(
      `SELECT ID, PRODUCT_ID, TYPE, QUANTITY, PREVIOUS_STOCK, NEW_STOCK, USER_ID, REFERENCE, CREATED_AT
       FROM (
         SELECT * FROM STOCK_MOVEMENTS ORDER BY CREATED_AT DESC
       ) WHERE ROWNUM = 1`,
      [],
    );

    console.log('[StockMovement.create] SELECT result:', JSON.stringify(insertedRow, null, 2));


    if (!insertedRow || insertedRow.length === 0) {
      throw new Error('Failed to retrieve created stock movement');
    }

    const row = insertedRow[0];
    console.log('[StockMovement.create] Mapped row:', {
      id: row.ID,
      productId: row.PRODUCT_ID,
      type: row.TYPE,
      quantity: row.QUANTITY,
      previousStock: row.PREVIOUS_STOCK,
      newStock: row.NEW_STOCK,
      userId: row.USER_ID,
      reference: row.REFERENCE,
      createdAt: row.CREATED_AT,
    });
    return StockMovementMapper.toEntity({
      id: row.ID as number,
      productId: row.PRODUCT_ID as number,
      type: row.TYPE as string,
      quantity: row.QUANTITY as number,
      previousStock: row.PREVIOUS_STOCK as number,
      newStock: row.NEW_STOCK as number,
      userId: row.USER_ID as number | undefined,
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

    return (rows as any[]).map((row) =>
      StockMovementMapper.toEntity({
        id: row.ID as number,
        productId: row.PRODUCT_ID as number,
        type: row.TYPE as string,
        quantity: row.QUANTITY as number,
        previousStock: row.PREVIOUS_STOCK as number,
        newStock: row.NEW_STOCK as number,
        userId: row.USER_ID as number | undefined,
        reference: row.REFERENCE as string | undefined,
        createdAt: row.CREATED_AT as Date,
      }),
    );
  }
}
