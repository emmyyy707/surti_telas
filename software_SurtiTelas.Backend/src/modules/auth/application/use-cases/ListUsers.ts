import type { AuthRepository } from '../../domain/repositories/AuthRepository';
import type { PublicUser } from '../dtos/AuthResult';

export class ListUsers {
  constructor(private readonly repo: AuthRepository) {}

  async execute(filters: {
    search?: string;
    role?: string;
    estado?: string;
    page?: number;
    limit?: number;
    sort?: 'nombre' | 'email' | 'createdAt';
    order?: 'asc' | 'desc';
  } = {}) {
    const result = await this.repo.listUsers(filters);
    return {
      data: result.data.map((u) => {
        const { passwordHash: _passwordHash, refreshToken: _refreshToken, ...safe } = u;
        return safe as PublicUser;
      }),
      meta: result.meta,
    };
  }
}
