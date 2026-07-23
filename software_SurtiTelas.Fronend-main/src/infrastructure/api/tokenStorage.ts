/**
 * Almacenamiento de tokens de sesión (solo access token).
 * El refresh token se almacena en una cookie httpOnly en el backend.
 */
const ACCESS_KEY = 'surtitelas.accessToken';

export const tokenStorage = {
  getAccessToken(): string | null {
    try {
      return localStorage.getItem(ACCESS_KEY);
    } catch {
      return null;
    }
  },
  getRefreshToken(): string | null {
    return null;
  },
  setTokens(accessToken: string, _refreshToken: string): void {
    this.setAccessToken(accessToken);
  },
  setAccessToken(accessToken: string): void {
    try {
      localStorage.setItem(ACCESS_KEY, accessToken);
    } catch {
      /* almacenamiento no disponible */
    }
  },
  clear(): void {
    try {
      localStorage.removeItem(ACCESS_KEY);
    } catch {
      /* almacenamiento no disponible */
    }
  },
};
