import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaClientRepository } from './repositories/client.repository';
import { PrismaTaxRepository } from './repositories/tax.repository';
import { PrismaErrorLogRepository } from './repositories/error-log.repository';
import { PrismaStockMovementRepository } from './repositories/stock-movement.repository';

@Module({
  providers: [
    PrismaService,
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
    'IClientRepository',
    'ITaxRepository',
    'IErrorLogRepository',
    'IStockMovementRepository',
  ],
})

export class PrismaModule {}
