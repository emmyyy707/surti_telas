export interface UserRecord {
  id: string;
  email: string;
  nombre: string;
  apellidos?: string;
  telefono?: string | null;
  direccion?: string | null;
  tipoDocumento?: string | null;
  numeroDocumento?: string | null;
  role: string;
  estado: 'ACTIVO' | 'INACTIVO';
  passwordHash: string;
  refreshToken?: string | null;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string | null;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
  failedLoginAttempts?: number;
  lockedUntil?: Date | null;
  googleId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  permissions?: string[];
  avatar?: string | null;
}

export interface AuthUser {
  id: string;
  email: string;
  nombre: string;
  role: string;
  permissions: string[];
}
