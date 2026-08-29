import type { CartRepository } from '@modules/carts/domain/repositories/cart.repository';
import { Order } from '@modules/orders/domain/entities/order.entity';
import { OrderItem } from '@modules/orders/domain/entities/order-item.entity';
import { EmptyCartException } from '@modules/orders/domain/exceptions/empty-cart.exception';
import type { EmailSenderPort } from '@modules/orders/domain/ports/email-sender.port';
import type { OrderRepository } from '@modules/orders/domain/repositories/order.repository';
import { DEFAULT_SHIPPING_ADDRESS } from '@modules/orders/domain/value-objects/shipping-address.vo';
import { ProductNotFoundException } from '@modules/products/domain/exceptions/product-not-found.exception';
import type { ProductRepository } from '@modules/products/domain/repositories/product.repository';
import type { LoggerPort } from '@shared/application/ports/logger.port';
import { v4 as uuid } from 'uuid';
import type { CheckoutDto } from '../dtos/checkout.dto';

export interface CheckoutInput {
  userId: string;
  userEmail: string;
  userName: string;
  dto: CheckoutDto;
}

export class CheckoutUseCase {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly cartRepo: CartRepository,
    private readonly productRepo: ProductRepository,
    private readonly emailSender: EmailSenderPort,
    private readonly logger: LoggerPort,
  ) {}

  async execute(input: CheckoutInput) {
    const { userId, userEmail, userName, dto } = input;
    this.logger.info('Iniciando proceso de checkout', { userId, userEmail });

    const cart = await this.cartRepo.getByUserId(userId);
    if (cart.isEmpty()) {
      throw new EmptyCartException();
    }

    const productIds = cart.getItems().map((i) => i.productId);
    for (const id of productIds) {
      const product = await this.productRepo.findById(id);
      if (!product) throw new ProductNotFoundException(id);
    }

    const orderItems = cart.getItems().map(
      (cartItem) =>
        new OrderItem({
          productId: cartItem.productId,
          productName: cartItem.productName,
          unitPrice: cartItem.unitPrice,
          quantity: cartItem.quantity,
          imageUrl: cartItem.imageUrl,
        }),
    );

    this.logger.info('Creando orden a partir del carrito', {
      userId,
      itemCount: orderItems.length,
      total: orderItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
      orderItems,
    });

    const order = Order.createPaid({
      id: uuid(),
      userId,
      items: orderItems,
      shippingAddress: dto.shippingAddress ?? DEFAULT_SHIPPING_ADDRESS,
      createdAt: new Date().toISOString(),
    });

    await this.orderRepo.executeCheckout({
      order,
      cartItems: cart.getItems(),
    });

    this.logger.info('Orden creada exitosamente', {
      orderId: order.id,
      userId,
      total: order.total,
      itemCount: order.items.length,
    });

    this.logger.info('Enviando email de confirmación', {
      data: {
        orderId: order.id,
        userId,
        to: userEmail,
      },
    });

    // El envio del correo no es blockeante
    try {
      await this.emailSender.sendOrderConfirmation({
        to: userEmail,
        userName,
        order,
      });
    } catch (err) {
      this.logger.error('Error enviando email de confirmación', {
        orderId: order.id,
        error: (err as Error).message,
      });
    }

    return order.toJSON();
  }
}
