import { randomBytes } from 'crypto';
import type { AuthRepository } from '../../domain/repositories/AuthRepository';
import type { EmailService } from '../../../shared/domain/services/EmailService';

export class ForgotPassword {
  constructor(private readonly repo: AuthRepository, private readonly emailService: EmailService) {}

  async execute(email: string): Promise<{ message: string; resetUrl?: string }> {
    const user = await this.repo.findByEmail(email);
    console.log(`[FORGOT-PASSWORD] lookup email=${email} found=${!!user}`);
    if (!user || user.estado !== 'ACTIVO') {
      return { message: 'Si el correo existe, recibirás instrucciones para restablecer tu contraseña' };
    }

    const resetToken = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    console.log(`[FORGOT-PASSWORD] saving token userId=${user.id}`);
    await this.repo.setResetPasswordToken(user.id, resetToken, expires);

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    console.log(`[FORGOT-PASSWORD] sending email to=${email} resetUrl=${resetUrl}`);
    let previewUrl: string | undefined;
    try {
      const result = await this.emailService.sendPasswordReset(email, resetToken);
      previewUrl = result.previewUrl;
    } catch (error) {
      console.error(`[FORGOT-PASSWORD] email failed`, error);
    }

    return {
      message: 'Si el correo existe, recibirás instrucciones para restablecer tu contraseña',
      resetUrl: previewUrl || resetUrl,
    };
  }
}
