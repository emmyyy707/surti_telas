import type { AuthRepository } from '../../domain/repositories/AuthRepository';
import type { PublicUser } from '../dtos/AuthResult';

export class GetUserById {
  constructor(private readonly repo: AuthRepository) {}

  async execute(id: string): Promise<PublicUser | null> {
    const user = await this.repo.findById(id);
    if (!user) return null;
    const { passwordHash: _passwordHash, refreshToken: _refreshToken, ...safe } = user;
    return safe as PublicUser;
  }
}
