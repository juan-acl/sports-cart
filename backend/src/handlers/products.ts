import { buildProductsRouter } from '@modules/products/presentation/products.routes';
import { buildContainer } from '@shared/infrastructure/di/container';
import { createExpressApp } from '@shared/infrastructure/http/express-app.factory';
import serverless from 'serverless-http';

const container = buildContainer();
const router = buildProductsRouter(container.resolve('productsController'));
const app = createExpressApp({ router, serviceName: 'products' });

export const handler = serverless(app);
