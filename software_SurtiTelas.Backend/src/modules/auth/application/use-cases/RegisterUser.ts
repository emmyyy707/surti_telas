import { Role } from '@prisma/client';
import { ConflictError } from '../../../../shared/domain/errors';
import type { AuthUser } from '../../domain/entities/User';
import type { AuthRepository } from '../../domain/repositories/AuthRepository';
import type { PasswordHasher } from '../../domain/services/PasswordHasher';
import type { TokenService } from '../../domain/services/TokenService';
import type { AuthResult } from './LoginUser';
import { eventBus } from '../../../../shared/infrastructure/eventBus';
import { UserCreatedEvent } from '../../../../shared/application/events';

export class RegisterUser {
  constructor(
    private readonly repo: AuthRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenService
  ) {}

  async execute(input: {
    nombre: string;
    email: string;
    password: string;
    role: Role;
    telefono?: string;
    direccion?: string;
  }): Promise<AuthResult> {
    const existing = await this.repo.findByEmail(input.email);
    if (existing) {
      throw new ConflictError('El correo ya está registrado');
    }

    const passwordHash = await this.hasher.hash(input.password);
    const user = await this.repo.create({
      email: input.email,
      nombre: input.nombre,
      passwordHash,
      role: input.role,
      telefono: input.telefono,
      direccion: input.direccion,
    });

    const permissions = await this.repo.findPermissionsByRole(user.role);
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      role: user.role,
      permissions,
    };

    const accessToken = this.tokens.signAccessToken(authUser);
    const refreshToken = this.tokens.signRefreshToken(authUser);
    const hashedRefresh = await this.hasher.hash(refreshToken);
    await this.repo.updateRefreshToken(user.id, hashedRefresh);

    eventBus.publish(
      new UserCreatedEvent({
        userId: authUser.id,
        nombre: authUser.nombre,
        email: authUser.email,
        role: authUser.role,
      })
    );

    return { accessToken, refreshToken, user: authUser };
  }
}
