import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaUnitOfWork } from './prisma-unit-of-work';
import { PrismaClientRepository } from './repositories/client.repository';
import { PrismaTaxRepository } from './repositories/tax.repository';
import { PrismaErrorLogRepository } from './repositories/error-log.repository';
import { PrismaStockMovementRepository } from './repositories/stock-movement.repository';

@Module({
  providers: [
    PrismaService,
    PrismaUnitOfWork,
    {
      provide: 'IUnitOfWork',
      useClass: PrismaUnitOfWork,
    },
    {
      provide: 'IClientRepository',
      useClass: PrismaClientRepository,
    },
    {
      provide: 'ITaxRepository',
      useClass: PrismaTaxRepository,
    },
    {
      provide: 'IErrorLogRepository',
      useClass: PrismaErrorLogRepository,
    },
    {
      provide: 'IStockMovementRepository',
      useClass: PrismaStockMovementRepository,
    },
  ],
  exports: [
    PrismaService,
    PrismaUnitOfWork,
    'IUnitOfWork',
    'IClientRepository',
    'ITaxRepository',
    'IErrorLogRepository',
    'IStockMovementRepository',
  ],
})
export class PrismaModule {}
