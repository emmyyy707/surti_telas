export class ConsoleEmailService {
  async sendPasswordReset(email: string, token: string): Promise<void> {
    const resetUrl = `http://localhost:5173/reset-password?token=${token}`;
    console.log(`[EMAIL] Password reset for ${email}: ${resetUrl}`);
  }
}
