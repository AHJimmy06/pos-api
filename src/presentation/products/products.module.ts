import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ProductsController } from '../controllers/products.controller';
import { ProductHandlers } from '../../application/products/handlers';
import { PrismaProductRepository } from '../../infrastructure/persistence/prisma/repositories/product.repository';
import { PrismaModule } from '../../infrastructure/persistence/prisma/prisma.module';

@Module({
  imports: [CqrsModule, PrismaModule],
  controllers: [ProductsController],
  providers: [
    ...ProductHandlers,
    {
      provide: 'IProductRepository',
      useClass: PrismaProductRepository,
    },
  ],
  exports: ['IProductRepository'],
})
export class ProductsModule {}
