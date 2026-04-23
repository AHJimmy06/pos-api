import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './infrastructure/persistence/prisma/prisma.module';
import { ClientsModule } from './presentation/clients/clients.module';
import { TaxesModule } from './presentation/taxes/taxes.module';
import { ProductsModule } from './presentation/products/products.module';
import { InvoicesModule } from './presentation/invoices/invoices.module';

@Module({
  imports: [
    PrismaModule,
    ClientsModule,
    TaxesModule,
    ProductsModule,
    InvoicesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
