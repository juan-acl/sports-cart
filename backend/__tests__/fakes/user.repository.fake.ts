import type { User } from '@modules/users/domain/entities/user.entity';
import type { UserRepository } from '@modules/users/domain/repositories/user.repository';

export class FakeUserRepository implements UserRepository {
  private store: Map<string, User> = new Map();

  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.store.values()) {
      if (user.email === email) return user;
    }
    return null;
  }

  async findById(id: string): Promise<User | null> {
    return this.store.get(id) ?? null;
  }

  async save(user: User): Promise<void> {
    this.store.set(user.id, user);
  }

  reset(): void {
    this.store.clear();
  }
}
