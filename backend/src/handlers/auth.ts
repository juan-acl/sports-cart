import { buildAuthRouter } from '@modules/auth/presentation/auth.routes';
import { buildContainer } from '@shared/infrastructure/di/container';
import { createExpressApp } from '@shared/infrastructure/http/express-app.factory';
import serverless from 'serverless-http';

const container = buildContainer();
const router = buildAuthRouter(container.resolve('authController'));
const app = createExpressApp({ router, serviceName: 'auth' });

export const handler = serverless(app);
