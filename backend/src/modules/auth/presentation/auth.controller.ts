import type { LoginDto } from '@modules/auth/application/dtos/login.dto';
import type { RegisterDto } from '@modules/auth/application/dtos/register.dto';
import type { LoginUseCase } from '@modules/auth/application/use-cases/login.use-case';
import type { RegisterUseCase } from '@modules/auth/application/use-cases/register.use-case';
import { ApiResponder } from '@shared/infrastructure/http/response.builder';
import type { NextFunction, Request, Response } from 'express';

export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.registerUseCase.execute(req.body as RegisterDto);
      ApiResponder.created(req, res, result);
    } catch (err) {
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.loginUseCase.execute(req.body as LoginDto);
      ApiResponder.ok(req, res, result);
    } catch (err) {
      next(err);
    }
  };
}
