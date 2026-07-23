import { UnauthorizedError } from '../../../../shared/domain/errors';
import type { AuthRepository } from '../../domain/repositories/AuthRepository';
import type { PasswordHasher } from '../../domain/services/PasswordHasher';

export class ChangePassword {
  constructor(
    private readonly repo: AuthRepository,
    private readonly hasher: PasswordHasher
  ) {}

  async execute(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.repo.findById(userId);
    if (!user) {
      throw new UnauthorizedError('Usuario no encontrado');
    }

    const valid = await this.hasher.compare(currentPassword, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError('Contraseña actual incorrecta');
    }

    const hashedPassword = await this.hasher.hash(newPassword);
    await this.repo.updatePassword(userId, hashedPassword);
  }
}
