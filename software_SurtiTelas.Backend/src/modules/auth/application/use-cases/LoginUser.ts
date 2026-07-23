import { UnauthorizedError } from '../../../../shared/domain/errors';
import type { AuthUser } from '../../domain/entities/User';
import type { AuthRepository } from '../../domain/repositories/AuthRepository';
import type { PasswordHasher } from '../../domain/services/PasswordHasher';
import type { TokenService } from '../../domain/services/TokenService';

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface LoginResultWith2FA {
  requiresTwoFactor: true;
  tempToken: string;
  user: Pick<AuthUser, 'id' | 'email' | 'nombre' | 'role'>;
}

export type LoginResult = AuthResult | LoginResultWith2FA;

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

export class LoginUser {
  constructor(
    private readonly repo: AuthRepository,
    private readonly tokens: TokenService,
    private readonly hasher: PasswordHasher
  ) {}

  async execute(input: { email: string; password: string }): Promise<LoginResult> {
    const user = await this.repo.findByEmail(input.email);
    if (!user || user.estado !== 'ACTIVO') {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      throw new UnauthorizedError(`Cuenta bloqueada temporalmente. Intenta de nuevo en ${remainingMinutes} minutos`);
    }

    const valid = await this.hasher.compare(input.password, user.passwordHash);
    if (!valid) {
      const newAttempts = (user.failedLoginAttempts || 0) + 1;
      if (newAttempts >= MAX_FAILED_ATTEMPTS) {
        const lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
        await this.repo.lockUser(user.id, lockedUntil);
        await this.repo.incrementFailedLoginAttempts(user.id);
        throw new UnauthorizedError(`Demasiados intentos fallidos. Cuenta bloqueada por ${LOCKOUT_DURATION_MS / 60000} minutos`);
      }
      await this.repo.incrementFailedLoginAttempts(user.id);
      throw new UnauthorizedError('Credenciales inválidas');
    }

    await this.repo.resetFailedLoginAttempts(user.id);

    const permissions = await this.repo.findPermissionsByRole(user.role);
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      role: user.role,
      permissions,
    };

    if (user.twoFactorEnabled) {
      const tempToken = this.tokens.signTempToken(authUser);
      return { requiresTwoFactor: true, tempToken, user: authUser };
    }

    const accessToken = this.tokens.signAccessToken(authUser);
    const refreshToken = this.tokens.signRefreshToken(authUser);
    const hashedRefresh = await this.hasher.hash(refreshToken);
    await this.repo.updateRefreshToken(user.id, hashedRefresh);

    return { accessToken, refreshToken, user: authUser };
  }
}
