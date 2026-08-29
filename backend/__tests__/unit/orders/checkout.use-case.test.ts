import { AddToCartUseCase } from '@modules/carts/application/use-cases/add-to-cart.use-case';
import {
  type CheckoutInput,
  CheckoutUseCase,
} from '@modules/orders/application/use-cases/checkout.use-case';
import { EmptyCartException } from '@modules/orders/domain/exceptions/empty-cart.exception';
import { Product } from '@modules/products/domain/entities/product.entity';
import { FakeCartRepository } from '../../fakes/cart.repository.fake';
import { FakeEmailSender } from '../../fakes/email-sender.fake';
import { FakeLogger } from '../../fakes/logger.fake';
import { FakeOrderRepository } from '../../fakes/order.repository.fake';
import { FakeProductRepository } from '../../fakes/product.repository.fake';

const makeProduct = (id = 'prod-1', price = 100, stock = 10) =>
  new Product({
    id,
    name: `Producto ${id}`,
    category: 'futbol',
    price,
    stock,
    description: '',
    imageUrl: '',
    createdAt: new Date().toISOString(),
  });

const defaultInput: CheckoutInput = {
  userId: 'user-1',
  userEmail: 'user@test.com',
  userName: 'Juan',
  dto: {
    shippingAddress: { street: 'Calle 1', city: 'Bogotá', country: 'CO', postalCode: '110111' },
  },
};

describe('CheckoutUseCase', () => {
  let cartRepo: FakeCartRepository;
  let productRepo: FakeProductRepository;
  let orderRepo: FakeOrderRepository;
  let emailSender: FakeEmailSender;
  let addToCart: AddToCartUseCase;
  let checkoutUseCase: CheckoutUseCase;

  beforeEach(() => {
    cartRepo = new FakeCartRepository();
    productRepo = new FakeProductRepository();
    orderRepo = new FakeOrderRepository();
    emailSender = new FakeEmailSender();
    addToCart = new AddToCartUseCase(cartRepo, productRepo);
    checkoutUseCase = new CheckoutUseCase(
      orderRepo,
      cartRepo,
      productRepo,
      emailSender,
      new FakeLogger(),
    );
  });

  it('crea una orden con los items del carrito', async () => {
    productRepo.seed(makeProduct('prod-1', 100));
    await addToCart.execute('user-1', { productId: 'prod-1', quantity: 2 });

    const order = await checkoutUseCase.execute(defaultInput);

    expect(order.userId).toBe('user-1');
    expect(order.items).toHaveLength(1);
    expect(order.total).toBe(200);
    expect(order.status).toBe('paid');
  });

  it('lanza EmptyCartException si el carrito está vacío', async () => {
    await expect(checkoutUseCase.execute(defaultInput)).rejects.toThrow(EmptyCartException);
  });

  it('envía email de confirmación después del checkout', async () => {
    productRepo.seed(makeProduct());
    await addToCart.execute('user-1', { productId: 'prod-1', quantity: 1 });

    await checkoutUseCase.execute(defaultInput);

    expect(emailSender.sent).toHaveLength(1);
    expect(emailSender.lastSent?.to).toBe('user@test.com');
  });

  it('la orden contiene la dirección de envío', async () => {
    productRepo.seed(makeProduct());
    await addToCart.execute('user-1', { productId: 'prod-1', quantity: 1 });

    const order = await checkoutUseCase.execute(defaultInput);

    expect(order.shippingAddress.city).toBe('Bogotá');
  });

  it('el total es la suma de todos los items', async () => {
    productRepo.seed(makeProduct('prod-1', 100));
    productRepo.seed(makeProduct('prod-2', 50));
    await addToCart.execute('user-1', { productId: 'prod-1', quantity: 2 });
    await addToCart.execute('user-1', { productId: 'prod-2', quantity: 3 });

    const order = await checkoutUseCase.execute(defaultInput);

    expect(order.total).toBe(350);
    expect(order.items).toHaveLength(2);
  });
});
