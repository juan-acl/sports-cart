import { validate } from '@shared/infrastructure/http/middlewares/validation.middleware';
import { Router } from 'express';
import { loginSchema } from '../application/dtos/login.dto';
import { registerSchema } from '../application/dtos/register.dto';
import type { AuthController } from './auth.controller';

export function buildAuthRouter(controller: AuthController): Router {
  const router = Router();
  const v1 = Router();

  v1.post('/auth/register', validate(registerSchema), controller.register);
  v1.post('/auth/login', validate(loginSchema), controller.login);

  router.use('/v1', v1);
  return router;
}
