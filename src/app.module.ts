import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './infrastructure/persistence/prisma/prisma.module';
import { ClientsModule } from './presentation/clients/clients.module';
import { TaxesModule } from './presentation/taxes/taxes.module';
import { ProductsModule } from './presentation/products/products.module';
import { InvoicesModule } from './presentation/invoices/invoices.module';
import { AuthModule } from './presentation/auth/auth.module';
import { UsersModule } from './presentation/users/users.module';
import { AllExceptionsFilter } from './infrastructure/web-common/filters/all-exceptions.filter';

@Module({
  imports: [
    PrismaModule,
    ClientsModule,
    TaxesModule,
    ProductsModule,
    InvoicesModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
