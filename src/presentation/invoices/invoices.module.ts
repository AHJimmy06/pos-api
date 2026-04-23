import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { InvoicesController } from '../controllers/invoices.controller';
import { InvoiceHandlers } from '../../application/invoices/handlers';
import { PrismaInvoiceRepository } from '../../infrastructure/persistence/prisma/repositories/invoice.repository';
import { PrismaModule } from '../../infrastructure/persistence/prisma/prisma.module';
import { ClientsModule } from '../clients/clients.module';
import { ProductsModule } from '../products/products.module';
import { TaxesModule } from '../taxes/taxes.module';

@Module({
  imports: [
    CqrsModule,
    PrismaModule,
    ClientsModule,
    ProductsModule,
    TaxesModule,
  ],
  controllers: [InvoicesController],
  providers: [
    ...InvoiceHandlers,
    {
      provide: 'IInvoiceRepository',
      useClass: PrismaInvoiceRepository,
    },
  ],
})
export class InvoicesModule {}
