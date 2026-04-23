import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaClientRepository } from './repositories/client.repository';
import { PrismaTaxRepository } from './repositories/tax.repository';

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
  ],
  exports: [PrismaService, 'IClientRepository', 'ITaxRepository'],
})
export class PrismaModule {}
