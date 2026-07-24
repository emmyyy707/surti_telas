import type { AuthRepository } from '../../domain/repositories/AuthRepository';
import type { PublicUser } from '../dtos/AuthResult';
import { Role } from '@prisma/client';

export class ListUsers {
  constructor(private readonly repo: AuthRepository) {}

  async execute(filters: {
    search?: string;
    role?: Role;
    estado?: 'ACTIVO' | 'INACTIVO';
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
