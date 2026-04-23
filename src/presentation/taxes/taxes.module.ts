import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TaxesController } from '../controllers/taxes.controller';
import { TaxHandlers } from '../../application/taxes/handlers';
import { PrismaTaxRepository } from '../../infrastructure/persistence/prisma/repositories/tax.repository';
import { PrismaModule } from '../../infrastructure/persistence/prisma/prisma.module';

@Module({
  imports: [CqrsModule, PrismaModule],
  controllers: [TaxesController],
  providers: [
    ...TaxHandlers,
    {
      provide: 'ITaxRepository',
      useClass: PrismaTaxRepository,
    },
  ],
  exports: ['ITaxRepository'],
})
export class TaxesModule {}
