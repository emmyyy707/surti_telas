import type { AuthRepository } from '../../domain/repositories/AuthRepository';

export class DisableTwoFactor {
  constructor(private readonly repo: AuthRepository) {}

  async execute(userId: string) {
    await this.repo.updateTwoFactorSecret(userId, null);
    await this.repo.enableTwoFactor(userId, false);
  }
}