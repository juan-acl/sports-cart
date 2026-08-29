import type { PaginatedResult, PaginationParams } from '@shared/domain/value-objects/pagination.vo';
import type { Product } from '../entities/product.entity';

export interface ListProductsParams extends PaginationParams {
  category?: string;
}

export interface ProductRepository {
  list(params: ListProductsParams): Promise<PaginatedResult<Product>>;
  findById(id: string): Promise<Product | null>;
}
