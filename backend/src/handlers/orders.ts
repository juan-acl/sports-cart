import { buildOrdersRouter } from '@modules/orders/presentation/orders.routes';
import { buildContainer } from '@shared/infrastructure/di/container';
import { createExpressApp } from '@shared/infrastructure/http/express-app.factory';
import serverless from 'serverless-http';

const container = buildContainer();
const router = buildOrdersRouter(container.resolve('ordersController'));
const app = createExpressApp({ router, serviceName: 'orders' });

export const handler = serverless(app);
