import { AddToCartUseCase } from '@modules/carts/application/use-cases/add-to-cart.use-case';
import { Product } from '@modules/products/domain/entities/product.entity';
import { InsufficientStockException } from '@modules/products/domain/exceptions/insufficient-stock.exception';
import { ProductNotFoundException } from '@modules/products/domain/exceptions/product-not-found.exception';
import { FakeCartRepository } from '../../fakes/cart.repository.fake';
import { FakeProductRepository } from '../../fakes/product.repository.fake';

const makeProduct = (overrides: Partial<{ id: string; stock: number }> = {}) =>
  new Product({
    id: overrides.id ?? 'prod-1',
    name: 'Pelota',
    category: 'futbol',
    price: 100,
    stock: overrides.stock ?? 10,
    description: 'Pelota de futbol',
    imageUrl: 'http://img.com/1.jpg',
    createdAt: new Date().toISOString(),
  });

describe('AddToCartUseCase', () => {
  let cartRepo: FakeCartRepository;
  let productRepo: FakeProductRepository;
  let useCase: AddToCartUseCase;

  beforeEach(() => {
    cartRepo = new FakeCartRepository();
    productRepo = new FakeProductRepository();
    useCase = new AddToCartUseCase(cartRepo, productRepo);
  });

  it('agrega un producto al carrito', async () => {
    productRepo.seed(makeProduct());

    const result = await useCase.execute('user-1', { productId: 'prod-1', quantity: 2 });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].productId).toBe('prod-1');
    expect(result.items[0].quantity).toBe(2);
  });

  it('calcula el total correctamente', async () => {
    productRepo.seed(makeProduct());

    const result = await useCase.execute('user-1', { productId: 'prod-1', quantity: 3 });

    expect(result.total).toBe(300);
  });

  it('reemplaza la cantidad si el producto ya está en el carrito', async () => {
    productRepo.seed(makeProduct());

    await useCase.execute('user-1', { productId: 'prod-1', quantity: 2 });
    const result = await useCase.execute('user-1', { productId: 'prod-1', quantity: 5 });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].quantity).toBe(5);
  });

  it('lanza ProductNotFoundException si el producto no existe', async () => {
    await expect(
      useCase.execute('user-1', { productId: 'no-existe', quantity: 1 }),
    ).rejects.toThrow(ProductNotFoundException);
  });

  it('lanza InsufficientStockException si no hay stock suficiente', async () => {
    productRepo.seed(makeProduct({ stock: 2 }));

    await expect(useCase.execute('user-1', { productId: 'prod-1', quantity: 5 })).rejects.toThrow(
      InsufficientStockException,
    );
  });

  it('los carritos de distintos usuarios son independientes', async () => {
    productRepo.seed(makeProduct());

    await useCase.execute('user-1', { productId: 'prod-1', quantity: 1 });
    const cart2 = await useCase.execute('user-2', { productId: 'prod-1', quantity: 3 });

    expect(cart2.items[0].quantity).toBe(3);
    const cart1 = await cartRepo.getByUserId('user-1');
    expect(cart1.getItems()[0].quantity).toBe(1);
  });
});
