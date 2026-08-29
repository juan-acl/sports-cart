import type { CheckoutDto } from '@modules/orders/application/dtos/checkout.dto';
import type { ListOrdersQuery } from '@modules/orders/application/dtos/list-orders.dto';
import type { CheckoutUseCase } from '@modules/orders/application/use-cases/checkout.use-case';
import type { GetOrderUseCase } from '@modules/orders/application/use-cases/get-order.use-case';
import type { ListUserOrdersUseCase } from '@modules/orders/application/use-cases/list-user-orders.use-case';
import type { AuthenticatedRequest } from '@shared/infrastructure/http/middlewares/auth.middleware';
import { ApiResponder } from '@shared/infrastructure/http/response.builder';
import type { NextFunction, Response } from 'express';
import { logger } from '@/shared/infrastructure/logging/winston.logger';

export class OrdersController {
  constructor(
    private readonly checkoutUseCase: CheckoutUseCase,
    private readonly listUserOrdersUseCase: ListUserOrdersUseCase,
    private readonly getOrderUseCase: GetOrderUseCase,
  ) {}

  checkout = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const order = await this.checkoutUseCase.execute({
        userId: req.user!.id,
        userEmail: req.user!.email,
        userName: req.user!.email.split('@')[0],
        dto: req.body as CheckoutDto,
      });
      ApiResponder.created(req, res, order);
    } catch (err) {
      next(err);
    }
  };

  list = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.listUserOrdersUseCase.execute(
        req.user!.id,
        req.query as unknown as ListOrdersQuery,
      );
      ApiResponder.paginated(req, res, result.orders, result.pagination);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orderId = Array.isArray(req.params.orderId)
        ? req.params.orderId[0]
        : req.params.orderId;
      logger.warn(`validando la ordenId ${orderId} para el usuario ${req.user!.id}`);
      const order = await this.getOrderUseCase.execute(req.user!.id, orderId);
      ApiResponder.ok(req, res, order);
    } catch (err) {
      next(err);
    }
  };
}
