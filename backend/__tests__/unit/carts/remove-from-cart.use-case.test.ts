import { AddToCartUseCase } from '@modules/carts/application/use-cases/add-to-cart.use-case';
import { RemoveFromCartUseCase } from '@modules/carts/application/use-cases/remove-from-cart.use-case';
import { Product } from '@modules/products/domain/entities/product.entity';
import { FakeCartRepository } from '../../fakes/cart.repository.fake';
import { FakeProductRepository } from '../../fakes/product.repository.fake';

const makeProduct = (id = 'prod-1') =>
  new Product({
    id,
    name: `Producto ${id}`,
    category: 'futbol',
    price: 50,
    stock: 10,
    description: '',
    imageUrl: '',
    createdAt: new Date().toISOString(),
  });

describe('RemoveFromCartUseCase', () => {
  let cartRepo: FakeCartRepository;
  let productRepo: FakeProductRepository;
  let addUseCase: AddToCartUseCase;
  let removeUseCase: RemoveFromCartUseCase;

  beforeEach(() => {
    cartRepo = new FakeCartRepository();
    productRepo = new FakeProductRepository();
    addUseCase = new AddToCartUseCase(cartRepo, productRepo);
    removeUseCase = new RemoveFromCartUseCase(cartRepo);
  });

  it('elimina un item del carrito', async () => {
    productRepo.seed(makeProduct('prod-1'));
    await addUseCase.execute('user-1', { productId: 'prod-1', quantity: 2 });

    const result = await removeUseCase.execute('user-1', 'prod-1');

    expect(result.items).toHaveLength(0);
  });

  it('solo elimina el producto indicado', async () => {
    productRepo.seed(makeProduct('prod-1'));
    productRepo.seed(makeProduct('prod-2'));
    await addUseCase.execute('user-1', { productId: 'prod-1', quantity: 1 });
    await addUseCase.execute('user-1', { productId: 'prod-2', quantity: 1 });

    const result = await removeUseCase.execute('user-1', 'prod-1');

    expect(result.items).toHaveLength(1);
    expect(result.items[0].productId).toBe('prod-2');
  });

  it('no lanza error si el producto no estaba en el carrito', async () => {
    await expect(removeUseCase.execute('user-1', 'no-existe')).resolves.not.toThrow();
  });
});
