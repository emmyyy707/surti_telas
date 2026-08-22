import { randomBytes } from 'crypto';
import type { AuthRepository } from '../../domain/repositories/AuthRepository';
import type { EmailService } from '../../../shared/domain/services/EmailService';
import { PasswordResetRequestedEvent } from '../../../../shared/application/events';
import { eventBus } from '../../../../shared/infrastructure/eventBus';

export class ForgotPassword {
  constructor(private readonly repo: AuthRepository, private readonly emailService: EmailService) {}

  async execute(email: string, requestId?: string): Promise<{ message: string }> {
    const user = await this.repo.findByEmail(email);
    console.log(`[FORGOT-PASSWORD] lookup email=${email} found=${!!user}`);
    if (!user || user.estado !== 'ACTIVO') {
      return { message: 'Si el correo existe, recibirás instrucciones para restablecer tu contraseña' };
    }

    const resetToken = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    console.log(`[FORGOT-PASSWORD] saving token userId=${user.id}`);
    await this.repo.setResetPasswordToken(user.id, resetToken, expires);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const isLocalhost = frontendUrl.includes('localhost') || frontendUrl.includes('127.0.0.1');
    const secureUrl = isLocalhost ? frontendUrl : frontendUrl.replace(/^http:\/\//i, 'https://');
    const resetUrl = `${secureUrl}/reset-password?token=${resetToken}`;
    console.log(`[FORGOT-PASSWORD] sending email to=${email} resetUrl=${resetUrl}`);
    await this.emailService.sendPasswordReset(email, resetToken);

    eventBus.publish(
      new PasswordResetRequestedEvent({
        userId: user.id,
        email,
      }),
      requestId
    );

    return {
      message: 'Si el correo existe, recibirás instrucciones para restablecer tu contraseña',
    };
  }
}
