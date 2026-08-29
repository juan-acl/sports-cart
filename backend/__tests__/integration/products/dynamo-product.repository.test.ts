import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoProductRepository } from '@modules/products/infrastructure/persistence/dynamo-product.repository';
import { KEY_PREFIXES, SK_VALUES } from '@shared/infrastructure/dynamodb/single-table.constants';
import { testDynamoClient } from '../../setup/dynamo-test-client';
import { createTestTable, deleteTestTable } from '../../setup/table-setup';

const TABLE_NAME_TEST_CARTS = 'ClaroEcommerce-test-products';

describe('DynamoProductRepository (integration)', () => {
  let repo: DynamoProductRepository;

  beforeAll(async () => {
    await createTestTable(TABLE_NAME_TEST_CARTS);
    repo = new DynamoProductRepository(testDynamoClient, TABLE_NAME_TEST_CARTS);
  });

  afterAll(async () => {
    await deleteTestTable(TABLE_NAME_TEST_CARTS);
  });

  // Inserta un producto directamente en DynamoDB replicando la estructura del seed
  async function seedProduct(id: string, category = 'futbol', price = 100) {
    await testDynamoClient.send(
      new PutCommand({
        TableName: TABLE_NAME_TEST_CARTS,
        Item: {
          PK: `${KEY_PREFIXES.PRODUCT}${id}`,
          SK: SK_VALUES.METADATA,
          GSI1PK: 'PRODUCT',
          GSI1SK: id,
          GSI2PK: `${KEY_PREFIXES.CATEGORY}${category}`,
          GSI2SK: `${KEY_PREFIXES.PRODUCT}${id}`,
          id,
          name: `Producto ${id}`,
          category,
          price,
          stock: 10,
          description: 'Descripción de prueba',
          imageUrl: `http://img.com/${id}.jpg`,
          createdAt: new Date().toISOString(),
        },
      }),
    );
  }

  it('encuentra un producto por id (GetItem con PK + SK)', async () => {
    await seedProduct('p-find-1');

    const found = await repo.findById('p-find-1');

    expect(found).not.toBeNull();
    expect(found?.name).toBe('Producto p-find-1');
    expect(found?.price).toBe(100);
  });

  it('retorna null si el producto no existe', async () => {
    const found = await repo.findById('no-existe');
    expect(found).toBeNull();
  });

  it('lista productos sin filtro usando GSI1 (todos los productos)', async () => {
    await seedProduct('p-all-1', 'tenis');
    await seedProduct('p-all-2', 'tenis');

    const result = await repo.list({ limit: 10 });

    expect(result.items.length).toBeGreaterThanOrEqual(2);
    expect(result.count).toBeGreaterThanOrEqual(2);
  });

  it('filtra por categoría usando GSI2', async () => {
    await seedProduct('p-basket-1', 'basketball');
    await seedProduct('p-basket-2', 'basketball');
    await seedProduct('p-swim-1', 'natacion');

    const result = await repo.list({ limit: 10, category: 'basketball' });

    expect(result.items.length).toBeGreaterThanOrEqual(2);
    expect(result.items.every((p) => p.category === 'basketball')).toBe(true);
  });

  it('respeta el limit de paginación y devuelve nextCursor', async () => {
    for (let i = 1; i <= 5; i++) {
      await seedProduct(`p-page-${i}`, 'ciclismo');
    }

    const page1 = await repo.list({ limit: 2, category: 'ciclismo' });

    expect(page1.items).toHaveLength(2);
    expect(page1.nextCursor).toBeDefined();
  });

  it('el cursor permite avanzar a la siguiente página sin repetir items', async () => {
    for (let i = 1; i <= 6; i++) {
      await seedProduct(`p-cursor-${i}`, 'rugby');
    }

    const page1 = await repo.list({ limit: 3, category: 'rugby' });
    const page2 = await repo.list({ limit: 3, category: 'rugby', cursor: page1.nextCursor });

    const ids1 = page1.items.map((p) => p.id);
    const ids2 = page2.items.map((p) => p.id);

    expect(ids2.length).toBeGreaterThan(0);
    expect(ids1.some((id) => ids2.includes(id))).toBe(false);
  });
});
