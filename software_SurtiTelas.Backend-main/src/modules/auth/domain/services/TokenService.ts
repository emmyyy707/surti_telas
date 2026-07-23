import type { AuthUser } from '../entities/User';

export interface TokenService {
  signAccessToken(user: AuthUser): string;
  signRefreshToken(user: AuthUser): string;
  signTempToken(user: AuthUser): string;
  verifyAccessToken(token: string): AuthUser;
  verifyRefreshToken(token: string): { userId: string };
  verifyTempToken(token: string): AuthUser;
}
