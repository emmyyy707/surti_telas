import { UnauthorizedError } from '../../../../shared/domain/errors';
import type { AuthUser } from '../../domain/entities/User';
import type { AuthRepository } from '../../domain/repositories/AuthRepository';
import type { TokenService } from '../../domain/services/TokenService';
import { verify } from 'otplib';

export interface VerifyTwoFactorInput {
  tempToken: string;
  code: string;
}

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export class VerifyTwoFactor {
  constructor(
    private readonly repo: AuthRepository,
    private readonly tokens: TokenService
  ) {}

  async execute(input: VerifyTwoFactorInput): Promise<AuthResult> {
    const user = this.tokens.verifyTempToken(input.tempToken);
    const record = await this.repo.findById(user.id);
    if (!record || !record.twoFactorSecret || !record.twoFactorEnabled) {
      throw new UnauthorizedError('2FA no habilitado para este usuario');
    }

    const isValid = await verify({ token: input.code, secret: record.twoFactorSecret });
    if (!isValid) {
      throw new UnauthorizedError('Código 2FA inválido');
    }

    const accessToken = this.tokens.signAccessToken(user);
    const refreshToken = this.tokens.signRefreshToken(user);
    await this.repo.updateRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken, user };
  }
}
