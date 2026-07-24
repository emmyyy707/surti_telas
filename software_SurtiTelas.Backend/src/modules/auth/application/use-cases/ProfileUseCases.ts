import { NotFoundError } from '../../../../shared/domain/errors';
import type { AuthRepository } from '../../domain/repositories/AuthRepository';
import type { PublicUser } from '../dtos/AuthResult';
import { eventBus } from '../../../../shared/infrastructure/eventBus';
import { UserUpdatedEvent } from '../../../../shared/application/events';

export class GetProfile {
  constructor(private readonly repo: AuthRepository) {}

  async execute(userId: string): Promise<PublicUser> {
    const user = await this.repo.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }
    const { passwordHash, refreshToken, ...safe } = user;
    void passwordHash;
    void refreshToken;
    return safe;
  }
}

export class UpdateProfile {
  constructor(private readonly repo: AuthRepository) {}

  async execute(userId: string, data: { nombre?: string; telefono?: string | null; direccion?: string | null; tipoDocumento?: string | null; numeroDocumento?: string | null }): Promise<PublicUser> {
    const user = await this.repo.updateProfile(userId, data);
    const { passwordHash, refreshToken, ...safe } = user;
    void passwordHash;
    void refreshToken;
    eventBus.publish(
      new UserUpdatedEvent({
        userId: safe.id,
        nombre: safe.nombre,
        cambios: data,
      })
    );
    return safe;
  }
}

export class Logout {
  constructor(private readonly repo: AuthRepository) {}

  async execute(userId: string): Promise<void> {
    await this.repo.updateRefreshToken(userId, null);
  }
}
