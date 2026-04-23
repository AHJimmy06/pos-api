import { CreateProductHandler } from './create-product.handler';
import { UpdateProductHandler } from './update-product.handler';
import { DeleteProductHandler } from './delete-product.handler';
import { GetProductHandler } from './get-product.handler';
import { GetProductsHandler } from './get-products.handler';

export const ProductHandlers = [
  CreateProductHandler,
  UpdateProductHandler,
  DeleteProductHandler,
  GetProductHandler,
  GetProductsHandler,
];
