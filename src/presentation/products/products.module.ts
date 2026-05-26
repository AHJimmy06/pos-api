import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ProductsController } from '../web/controllers/products.controller';
import { CreateProductHandler } from '../../application/products/create-product.handler';
import { DeleteProductHandler } from '../../application/products/delete-product.handler';
import { GetProductHandler } from '../../application/products/get-product.handler';
import { GetProductsForSaleHandler } from '../../application/products/get-products-for-sale.handler';
import { GetProductsHandler } from '../../application/products/get-products.handler';
import { UpdateProductHandler } from '../../application/products/update-product.handler';
import { PrismaProductRepository } from '../../infrastructure/persistence/prisma/repositories/product.repository';
import { PrismaModule } from '../../infrastructure/persistence/prisma/prisma.module';
import { TOKENS } from '../../application/common/tokens/tokens';

const ProductHandlers = [
  CreateProductHandler,
  DeleteProductHandler,
  GetProductHandler,
  GetProductsForSaleHandler,
  GetProductsHandler,
  UpdateProductHandler,
];

@Module({
  imports: [CqrsModule, PrismaModule],
  controllers: [ProductsController],
  providers: [
    ...ProductHandlers,
    {
      provide: TOKENS.PRODUCT_REPOSITORY,
      useClass: PrismaProductRepository,
    },
  ],
  exports: [TOKENS.PRODUCT_REPOSITORY],
})
export class ProductsModule {}
