import { NotFoundError } from '../../../../shared/domain/errors';
import type { AuthRepository } from '../../domain/repositories/AuthRepository';
import type { PasswordHasher } from '../../domain/services/PasswordHasher';
import { PasswordResetAttemptedEvent } from '../../../../shared/application/events';
import { eventBus } from '../../../../shared/infrastructure/eventBus';
import { redisClient } from '../../../../config/redis';

const RESET_COOLDOWN_SECONDS = 15 * 60;
const RESET_COOLDOWN_KEY_PREFIX = 'ratelimit:reset-password:user:';

export class ResetPassword {
  constructor(
    private readonly repo: AuthRepository,
    private readonly hasher: PasswordHasher
  ) {}

  async execute(token: string, newPassword: string, requestId?: string): Promise<{ user: { id: string; email: string } }> {
    const user = await this.repo.findByResetPasswordToken(token);
    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      eventBus.publish(
        new PasswordResetAttemptedEvent({
          userId: 'unknown',
          email: '',
          success: false,
          reason: 'invalid_or_expired_token',
        }),
        requestId
      );
      throw new NotFoundError('Token de restablecimiento inválido o expirado');
    }

    const cooldownKey = `${RESET_COOLDOWN_KEY_PREFIX}${user.id}`;
    if (redisClient.isReady) {
      const lastReset = await redisClient.get(cooldownKey);
      if (lastReset) {
        eventBus.publish(
          new PasswordResetAttemptedEvent({
            userId: user.id,
            email: user.email,
            success: false,
            reason: 'cooldown_active',
          }),
          requestId
        );
        throw new NotFoundError('Debes esperar antes de volver a restablecer tu contraseña');
      }
    }

    const hashedPassword = await this.hasher.hash(newPassword);
    await this.repo.updatePassword(user.id, hashedPassword);
    await this.repo.clearResetPasswordToken(user.id);

    if (redisClient.isReady) {
      await redisClient.setEx(cooldownKey, RESET_COOLDOWN_SECONDS, '1');
    }

    eventBus.publish(
      new PasswordResetAttemptedEvent({
        userId: user.id,
        email: user.email,
        success: true,
      }),
      requestId
    );

    return { user: { id: user.id, email: user.email } };
  }
}
