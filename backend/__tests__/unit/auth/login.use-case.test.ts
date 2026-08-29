import { LoginUseCase } from '@modules/auth/application/use-cases/login.use-case';
import { RegisterUseCase } from '@modules/auth/application/use-cases/register.use-case';
import { UnauthorizedException } from '@shared/domain/exceptions/domain.exception';
import { FakePasswordHasher } from '../../fakes/password-hasher.fake';
import { FakeTokenService } from '../../fakes/token-service.fake';
import { FakeUserRepository } from '../../fakes/user.repository.fake';

describe('LoginUseCase', () => {
  let userRepo: FakeUserRepository;
  let hasher: FakePasswordHasher;
  let tokenService: FakeTokenService;
  let loginUseCase: LoginUseCase;

  beforeEach(async () => {
    userRepo = new FakeUserRepository();
    hasher = new FakePasswordHasher();
    tokenService = new FakeTokenService();
    loginUseCase = new LoginUseCase(userRepo, hasher, tokenService);

    const register = new RegisterUseCase(userRepo, hasher, tokenService);
    await register.execute({ name: 'Juan', email: 'juan@test.com', password: 'password123' });
  });

  it('retorna usuario y token con credenciales correctas', async () => {
    const result = await loginUseCase.execute({ email: 'juan@test.com', password: 'password123' });

    expect(result.user.email).toBe('juan@test.com');
    expect(result.token).toBeTruthy();
  });

  it('lanza UnauthorizedException si el email no existe', async () => {
    await expect(
      loginUseCase.execute({ email: 'noexiste@test.com', password: 'password123' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('lanza UnauthorizedException si la contraseña es incorrecta', async () => {
    await expect(
      loginUseCase.execute({ email: 'juan@test.com', password: 'wrongpassword' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('el token contiene el sub y email correctos', async () => {
    const result = await loginUseCase.execute({ email: 'juan@test.com', password: 'password123' });

    const payload = tokenService.verify(result.token);
    expect(payload.email).toBe('juan@test.com');
    expect(payload.sub).toBe(result.user.id);
  });
});
