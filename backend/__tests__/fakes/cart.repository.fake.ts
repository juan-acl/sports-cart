import { Cart } from '@modules/carts/domain/entities/cart.entity';
import type { CartItem } from '@modules/carts/domain/entities/cart-item.entity';
import type { CartRepository } from '@modules/carts/domain/repositories/cart.repository';

export class FakeCartRepository implements CartRepository {
  private store: Map<string, CartItem[]> = new Map();

  async getByUserId(userId: string): Promise<Cart> {
    const items = this.store.get(userId) ?? [];
    return new Cart(userId, [...items]);
  }

  async upsertItem(userId: string, item: CartItem): Promise<void> {
    const items = this.store.get(userId) ?? [];
    const index = items.findIndex((i) => i.productId === item.productId);
    if (index >= 0) {
      items[index] = item;
    } else {
      items.push(item);
    }
    this.store.set(userId, items);
  }

  async removeItem(userId: string, productId: string): Promise<void> {
    const items = this.store.get(userId) ?? [];
    this.store.set(
      userId,
      items.filter((i) => i.productId !== productId),
    );
  }

  async clear(userId: string): Promise<void> {
    this.store.delete(userId);
  }

  reset(): void {
    this.store.clear();
  }
}
