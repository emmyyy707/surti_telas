export class ConsoleEmailService {
  async sendPasswordReset(email: string, token: string): Promise<{ previewUrl?: string }> {
    const resetUrl = `http://localhost:5173/reset-password?token=${token}`;
    console.log(`[EMAIL] Password reset for ${email}: ${resetUrl}`);
    return { previewUrl: resetUrl };
  }
}
