import { RegisterUseCase } from '@modules/auth/application/use-cases/register.use-case';
import { ConflictException } from '@shared/domain/exceptions/domain.exception';
import { FakePasswordHasher } from '../../fakes/password-hasher.fake';
import { FakeTokenService } from '../../fakes/token-service.fake';
import { FakeUserRepository } from '../../fakes/user.repository.fake';

describe('RegisterUseCase', () => {
  let userRepo: FakeUserRepository;
  let hasher: FakePasswordHasher;
  let tokenService: FakeTokenService;
  let useCase: RegisterUseCase;

  beforeEach(() => {
    userRepo = new FakeUserRepository();
    hasher = new FakePasswordHasher();
    tokenService = new FakeTokenService();
    useCase = new RegisterUseCase(userRepo, hasher, tokenService);
  });

  it('registra un usuario nuevo y devuelve token', async () => {
    const result = await useCase.execute({
      name: 'Juan',
      email: 'juan@test.com',
      password: 'password123',
    });

    expect(result.user.email).toBe('juan@test.com');
    expect(result.user.name).toBe('Juan');
    expect(result.token).toBeTruthy();
    expect(result.user).not.toHaveProperty('passwordHash');
  });

  it('normaliza el email a minúsculas', async () => {
    const result = await useCase.execute({
      name: 'Juan',
      email: 'JUAN@TEST.COM',
      password: 'password123',
    });

    expect(result.user.email).toBe('juan@test.com');
  });

  it('hashea la contraseña antes de guardar', async () => {
    await useCase.execute({ name: 'Juan', email: 'juan@test.com', password: 'password123' });

    const saved = await userRepo.findByEmail('juan@test.com');
    expect(saved!.passwordHash).toBe('hashed:password123');
    expect(saved!.passwordHash).not.toBe('password123');
  });

  it('lanza ConflictException si el email ya existe', async () => {
    const dto = { name: 'Juan', email: 'juan@test.com', password: 'password123' };
    await useCase.execute(dto);

    await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
  });

  it('el token contiene el id y email del usuario', async () => {
    const result = await useCase.execute({
      name: 'Juan',
      email: 'juan@test.com',
      password: 'password123',
    });

    const payload = tokenService.verify(result.token);
    expect(payload.email).toBe('juan@test.com');
    expect(payload.sub).toBe(result.user.id);
  });
});
