import type { AddToCartDto } from '@modules/carts/application/dtos/add-to-cart.dto';
import type { UpdateCartItemBodyDto } from '@modules/carts/application/dtos/update-cart-item.dto';
import type { AddToCartUseCase } from '@modules/carts/application/use-cases/add-to-cart.use-case';
import type { GetCartUseCase } from '@modules/carts/application/use-cases/get-cart.use-case';
import type { RemoveFromCartUseCase } from '@modules/carts/application/use-cases/remove-from-cart.use-case';
import type { UpdateCartItemUseCase } from '@modules/carts/application/use-cases/update-cart-item.use-case';
import type { AuthenticatedRequest } from '@shared/infrastructure/http/middlewares/auth.middleware';
import { ApiResponder } from '@shared/infrastructure/http/response.builder';
import type { NextFunction, Response } from 'express';

export class CartsController {
  constructor(
    private readonly getCartUseCase: GetCartUseCase,
    private readonly addToCartUseCase: AddToCartUseCase,
    private readonly removeFromCartUseCase: RemoveFromCartUseCase,
    private readonly updateCartItemUseCase: UpdateCartItemUseCase,
  ) {}

  getCart = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cart = await this.getCartUseCase.execute(req.user!.id);
      ApiResponder.ok(req, res, cart);
    } catch (err) {
      next(err);
    }
  };

  addItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cart = await this.addToCartUseCase.execute(req.user!.id, req.body as AddToCartDto);
      ApiResponder.ok(req, res, cart);
    } catch (err) {
      next(err);
    }
  };

  updateItem = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const body = req.body as UpdateCartItemBodyDto;
      const productId = Array.isArray(req.params.productId)
        ? req.params.productId[0]
        : req.params.productId;
      const cart = await this.updateCartItemUseCase.execute(req.user!.id, productId, body.quantity);
      ApiResponder.ok(req, res, cart);
    } catch (err) {
      next(err);
    }
  };

  removeItem = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const productId = Array.isArray(req.params.productId)
        ? req.params.productId[0]
        : req.params.productId;
      const cart = await this.removeFromCartUseCase.execute(req.user!.id, productId);
      ApiResponder.ok(req, res, cart);
    } catch (err) {
      next(err);
    }
  };
}
