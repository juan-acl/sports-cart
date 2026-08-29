import { User } from '@modules/users/domain/entities/user.entity';
import { DynamoUserRepository } from '@modules/users/infrastructure/persistence/dynamo-user.repository';
import { testDynamoClient } from '../../setup/dynamo-test-client';
import { createTestTable, deleteTestTable } from '../../setup/table-setup';

const TABLE_NAME_TEST_CARTS = 'ClaroEcommerce-test-users';

describe('DynamoUserRepository (integration)', () => {
  let repo: DynamoUserRepository;

  beforeAll(async () => {
    await createTestTable(TABLE_NAME_TEST_CARTS);
    repo = new DynamoUserRepository(testDynamoClient, TABLE_NAME_TEST_CARTS);
  });

  afterAll(async () => {
    await deleteTestTable(TABLE_NAME_TEST_CARTS);
  });

  const makeUser = (overrides: Partial<{ id: string; email: string }> = {}) =>
    new User({
      id: overrides.id ?? 'user-test-1',
      email: overrides.email ?? 'test@example.com',
      name: 'Test User',
      passwordHash: 'hashed:password',
      createdAt: new Date().toISOString(),
    });

  it('guarda y recupera un usuario por id', async () => {
    const user = makeUser();
    await repo.save(user);

    const found = await repo.findById(user.id);

    expect(found).not.toBeNull();
    expect(found?.email).toBe('test@example.com');
    expect(found?.name).toBe('Test User');
  });

  it('encuentra un usuario por email usando GSI1', async () => {
    const user = makeUser({ id: 'user-gsi-test', email: 'gsi@example.com' });
    await repo.save(user);

    const found = await repo.findByEmail('gsi@example.com');

    expect(found).not.toBeNull();
    expect(found?.id).toBe('user-gsi-test');
  });

  it('retorna null si el id no existe', async () => {
    const found = await repo.findById('id-que-no-existe');
    expect(found).toBeNull();
  });

  it('retorna null si el email no existe', async () => {
    const found = await repo.findByEmail('noexiste@example.com');
    expect(found).toBeNull();
  });

  it('no expone el passwordHash en toJSON', async () => {
    const user = makeUser({ id: 'juan-id-2' });
    await repo.save(user);

    const found = await repo.findById(user.id);
    const json = found?.toJSON();

    expect(json).not.toHaveProperty('passwordHash');
  });
});
