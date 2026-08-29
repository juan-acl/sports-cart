import { validate } from '@shared/infrastructure/http/middlewares/validation.middleware';
import { Router } from 'express';
import { listProductsQuerySchema } from '../application/dtos/list-products.dto';
import { productIdParamsSchema } from '../application/dtos/product-id.dto';
import type { ProductsController } from './products.controller';

export function buildProductsRouter(controller: ProductsController): Router {
  const router = Router();
  const v1 = Router();

  v1.get('/products', validate(listProductsQuerySchema, 'query'), controller.list);
  v1.get('/products/:id', validate(productIdParamsSchema, 'params'), controller.getById);

  router.use('/v1', v1);
  return router;
}
