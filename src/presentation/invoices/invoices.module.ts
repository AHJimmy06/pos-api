import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { InvoicesController } from '../web/controllers/invoices.controller';
import { ChangeInvoiceStatusHandler } from '../../application/invoices/change-invoice-status.handler';
import { CreateInvoiceHandler } from '../../application/invoices/create-invoice.handler';
import { GetInvoiceHandler } from '../../application/invoices/get-invoice.handler';
import { GetInvoiceByNumberHandler } from '../../application/invoices/get-invoice-by-number.handler';
import { GetInvoicesHandler } from '../../application/invoices/get-invoices.handler';
import { UpdateInvoiceHandler } from '../../application/invoices/update-invoice.handler';
import { PrismaInvoiceRepository } from '../../infrastructure/persistence/prisma/repositories/invoice.repository';
import { PrismaModule } from '../../infrastructure/persistence/prisma/prisma.module';
import { ClientsModule } from '../clients/clients.module';
import { ProductsModule } from '../products/products.module';
import { TaxesModule } from '../taxes/taxes.module';
import { AuthModule } from '../auth/auth.module';
import { PdfService } from '../../infrastructure/web-common/services/pdf.service';
import { TOKENS } from '../../application/common/tokens/tokens';

const InvoiceHandlers = [
  ChangeInvoiceStatusHandler,
  CreateInvoiceHandler,
  GetInvoiceHandler,
  GetInvoiceByNumberHandler,
  GetInvoicesHandler,
  UpdateInvoiceHandler,
];

@Module({
  imports: [
    CqrsModule,
    PrismaModule,
    ClientsModule,
    ProductsModule,
    TaxesModule,
    AuthModule,
  ],
  controllers: [InvoicesController],
  providers: [
    ...InvoiceHandlers,
    PdfService,
    {
      provide: TOKENS.INVOICE_REPOSITORY,
      useClass: PrismaInvoiceRepository,
    },
  ],
})
export class InvoicesModule {}
