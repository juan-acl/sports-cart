import { CartItem } from '@modules/carts/domain/entities/cart-item.entity';
import { DynamoCartRepository } from '@modules/carts/infrastructure/persistence/dynamo-cart.repository';
import { testDynamoClient } from '../../setup/dynamo-test-client';
import { createTestTable, deleteTestTable } from '../../setup/table-setup';

const TABLE_NAME_TEST_CARTS = 'ClaroEcommerce-test-carts';

describe('DynamoCartRepository (integration)', () => {
  let repo: DynamoCartRepository;
  const userId = 'test-user-cart';

  beforeAll(async () => {
    await createTestTable(TABLE_NAME_TEST_CARTS);
    repo = new DynamoCartRepository(testDynamoClient, TABLE_NAME_TEST_CARTS);
  });

  afterAll(async () => {
    await deleteTestTable(TABLE_NAME_TEST_CARTS);
  });

  afterEach(async () => {
    await repo.clear(userId);
  });

  const makeItem = (productId = 'prod-1', quantity = 2) =>
    new CartItem({
      productId,
      productName: `Producto ${productId}`,
      unitPrice: 100,
      quantity,
      imageUrl: 'http://img.com/1.jpg',
      addedAt: new Date().toISOString(),
    });

  it('carrito vacío para un usuario sin items', async () => {
    const cart = await repo.getByUserId(userId);

    expect(cart.isEmpty()).toBe(true);
    expect(cart.itemCount).toBe(0);
  });

  it('guarda y recupera un item', async () => {
    await repo.upsertItem(userId, makeItem('prod-1', 3));

    const cart = await repo.getByUserId(userId);

    expect(cart.itemCount).toBe(1);
    expect(cart.getItems()[0].productId).toBe('prod-1');
    expect(cart.getItems()[0].quantity).toBe(3);
  });

  it('upsert sobreescribe la cantidad del mismo producto', async () => {
    await repo.upsertItem(userId, makeItem('prod-1', 2));
    await repo.upsertItem(userId, makeItem('prod-1', 5));

    const cart = await repo.getByUserId(userId);

    expect(cart.itemCount).toBe(1);
    expect(cart.getItems()[0].quantity).toBe(5);
  });

  it('almacena múltiples productos bajo el mismo PK de usuario', async () => {
    await repo.upsertItem(userId, makeItem('prod-1', 1));
    await repo.upsertItem(userId, makeItem('prod-2', 2));
    await repo.upsertItem(userId, makeItem('prod-3', 3));

    const cart = await repo.getByUserId(userId);

    expect(cart.itemCount).toBe(3);
    expect(cart.total).toBe(600);
  });

  it('elimina solo el producto indicado, deja los demás intactos', async () => {
    await repo.upsertItem(userId, makeItem('prod-1', 1));
    await repo.upsertItem(userId, makeItem('prod-2', 2));

    await repo.removeItem(userId, 'prod-1');

    const cart = await repo.getByUserId(userId);
    expect(cart.itemCount).toBe(1);
    expect(cart.getItems()[0].productId).toBe('prod-2');
  });

  it('clear deja el carrito vacío', async () => {
    await repo.upsertItem(userId, makeItem('prod-1', 1));
    await repo.upsertItem(userId, makeItem('prod-2', 2));

    await repo.clear(userId);

    const cart = await repo.getByUserId(userId);
    expect(cart.isEmpty()).toBe(true);
  });

  it('los items de un usuario no afectan los de otro (aislamiento por PK)', async () => {
    const otherUser = 'other-user-cart';

    await repo.upsertItem(userId, makeItem('prod-1', 5));
    await repo.upsertItem(otherUser, makeItem('prod-1', 99));

    const cart = await repo.getByUserId(userId);
    expect(cart.getItems()[0].quantity).toBe(5);

    await repo.clear(otherUser);
  });
});
