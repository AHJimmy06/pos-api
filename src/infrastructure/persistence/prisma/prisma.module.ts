import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaClientRepository } from './repositories/client.repository';
import { PrismaTaxRepository } from './repositories/tax.repository';
import { PrismaErrorLogRepository } from './repositories/error-log.repository';

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
  ],
  exports: [
    PrismaService,
    'IClientRepository',
    'ITaxRepository',
    'IErrorLogRepository',
  ],
})
export class PrismaModule {}
