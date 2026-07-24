import type { AuthUser } from '../modules/auth/domain/entities/User';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      requestId?: string;
    }
  }
}

export {};
