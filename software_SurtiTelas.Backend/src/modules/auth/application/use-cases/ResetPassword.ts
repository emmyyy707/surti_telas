import { NotFoundError } from '../../../../shared/domain/errors';
import type { AuthRepository } from '../../domain/repositories/AuthRepository';
import type { PasswordHasher } from '../../domain/services/PasswordHasher';

export class ResetPassword {
  constructor(
    private readonly repo: AuthRepository,
    private readonly hasher: PasswordHasher
  ) {}

  async execute(token: string, newPassword: string): Promise<void> {
    const user = await this.repo.findByResetPasswordToken(token);
    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      throw new NotFoundError('Token de restablecimiento inválido o expirado');
    }

    const hashedPassword = await this.hasher.hash(newPassword);
    await this.repo.updatePassword(user.id, hashedPassword);
    await this.repo.clearResetPasswordToken(user.id);
  }
}
