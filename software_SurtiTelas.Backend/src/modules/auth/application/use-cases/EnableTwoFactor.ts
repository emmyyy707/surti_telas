import { generateSecret, generateURI } from 'otplib';
import type { AuthRepository } from '../../domain/repositories/AuthRepository';

export class EnableTwoFactor {
  constructor(private readonly repo: AuthRepository) {}

  async execute(userId: string) {
    const secret = generateSecret();
    const otpauthUrl = generateURI({ strategy: 'totp', issuer: 'SurtiTelas', label: 'admin@surtitelas.com', secret });
    await this.repo.updateTwoFactorSecret(userId, secret);
    await this.repo.enableTwoFactor(userId, true);
    return { secret, otpauthUrl };
  }
}
