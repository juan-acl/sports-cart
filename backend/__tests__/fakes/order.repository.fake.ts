import type { Order } from '@modules/orders/domain/entities/order.entity';
import type {
  CheckoutTransaction,
  OrderRepository,
} from '@modules/orders/domain/repositories/order.repository';
import type { PaginatedResult, PaginationParams } from '@shared/domain/value-objects/pagination.vo';

export class FakeOrderRepository implements OrderRepository {
  private store: Map<string, Order> = new Map();

  async executeCheckout({ order }: CheckoutTransaction): Promise<void> {
    this.store.set(order.id, order);
  }

  async listByUserId(userId: string, params: PaginationParams): Promise<PaginatedResult<Order>> {
    const all = [...this.store.values()].filter((o) => o.userId === userId);

    const startIndex = params.cursor ? all.findIndex((o) => o.id === params.cursor) + 1 : 0;
    const page = all.slice(startIndex, startIndex + params.limit);
    const nextItem = all[startIndex + params.limit];

    return { items: page, nextCursor: nextItem?.id, count: page.length };
  }

  async findByIdForUser(orderId: string, userId: string): Promise<Order | null> {
    const order = this.store.get(orderId);
    if (!order || order.userId !== userId) return null;
    return order;
  }

  reset(): void {
    this.store.clear();
  }
}
