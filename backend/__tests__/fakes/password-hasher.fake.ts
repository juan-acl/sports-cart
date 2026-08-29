import type { PasswordHasherPort } from '@modules/auth/domain/ports/password-hasher.port';

export class FakePasswordHasher implements PasswordHasherPort {
  async hash(plain: string): Promise<string> {
    return `hashed:${plain}`;
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return hash === `hashed:${plain}`;
  }
}
