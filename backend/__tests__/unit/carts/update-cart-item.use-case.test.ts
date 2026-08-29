import { AddToCartUseCase } from '@modules/carts/application/use-cases/add-to-cart.use-case';
import { UpdateCartItemUseCase } from '@modules/carts/application/use-cases/update-cart-item.use-case';
import { Product } from '@modules/products/domain/entities/product.entity';
import { InsufficientStockException } from '@modules/products/domain/exceptions/insufficient-stock.exception';
import { NotFoundException } from '@shared/domain/exceptions/domain.exception';
import { FakeCartRepository } from '../../fakes/cart.repository.fake';
import { FakeProductRepository } from '../../fakes/product.repository.fake';

const makeProduct = (stock = 10) =>
  new Product({
    id: 'prod-1',
    name: 'Pelota',
    category: 'futbol',
    price: 100,
    stock,
    description: '',
    imageUrl: '',
    createdAt: new Date().toISOString(),
  });

describe('UpdateCartItemUseCase', () => {
  let cartRepo: FakeCartRepository;
  let productRepo: FakeProductRepository;
  let addUseCase: AddToCartUseCase;
  let updateUseCase: UpdateCartItemUseCase;

  beforeEach(async () => {
    cartRepo = new FakeCartRepository();
    productRepo = new FakeProductRepository();
    addUseCase = new AddToCartUseCase(cartRepo, productRepo);
    updateUseCase = new UpdateCartItemUseCase(cartRepo, productRepo);

    productRepo.seed(makeProduct());
    await addUseCase.execute('user-1', { productId: 'prod-1', quantity: 2 });
  });

  it('actualiza la cantidad del item', async () => {
    const result = await updateUseCase.execute('user-1', 'prod-1', 7);

    expect(result.items[0].quantity).toBe(7);
  });

  it('recalcula el total con la nueva cantidad', async () => {
    const result = await updateUseCase.execute('user-1', 'prod-1', 4);

    expect(result.total).toBe(400);
  });

  it('lanza NotFoundException si el producto no está en el carrito', async () => {
    await expect(updateUseCase.execute('user-1', 'no-en-carrito', 3)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('lanza InsufficientStockException si la nueva cantidad supera el stock', async () => {
    productRepo.reset();
    productRepo.seed(makeProduct(3));

    await expect(updateUseCase.execute('user-1', 'prod-1', 5)).rejects.toThrow(
      InsufficientStockException,
    );
  });
});
