import type { Product } from '@modules/products/domain/entities/product.entity';
import type {
  ListProductsParams,
  ProductRepository,
} from '@modules/products/domain/repositories/product.repository';
import type { PaginatedResult } from '@shared/domain/value-objects/pagination.vo';

export class FakeProductRepository implements ProductRepository {
  private store: Map<string, Product> = new Map();

  seed(product: Product): void {
    this.store.set(product.id, product);
  }

  async list(params: ListProductsParams): Promise<PaginatedResult<Product>> {
    let items = [...this.store.values()];

    if (params.category) {
      items = items.filter((p) => p.category === params.category);
    }

    const startIndex = params.cursor ? items.findIndex((p) => p.id === params.cursor) + 1 : 0;
    const page = items.slice(startIndex, startIndex + params.limit);
    const nextItem = items[startIndex + params.limit];

    return {
      items: page,
      nextCursor: nextItem?.id,
      count: page.length,
    };
  }

  async findById(id: string): Promise<Product | null> {
    return this.store.get(id) ?? null;
  }

  reset(): void {
    this.store.clear();
  }
}
