import { Injectable } from '@nestjs/common';
import { PrismaUnitOfWork } from '../prisma-unit-of-work';
import { IStockMovementRepository } from '../../../../application/common/interfaces/stock-movement.repository.interface';
import { StockMovement as StockMovementEntity } from '../../../../domain/entities/stock-movement.entity';
import { StockMovementMapper } from '../mappers/stock-movement.mapper';

@Injectable()
export class PrismaStockMovementRepository extends IStockMovementRepository {
  constructor(private readonly uow: PrismaUnitOfWork) {
    super();
  }

  private get prisma() {
    return this.uow.getClient();
  }

  async create(movement: StockMovementEntity): Promise<StockMovementEntity> {
    const data = StockMovementMapper.toPersistence(movement);
    const created = await this.prisma.stockMovement.create({
      data,
    });
    return StockMovementMapper.toEntity(created);
  }

  async findByProductId(productId: number): Promise<StockMovementEntity[]> {
    const movements = await this.prisma.stockMovement.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    });
    return movements.map((m) => StockMovementMapper.toEntity(m));
  }
}
