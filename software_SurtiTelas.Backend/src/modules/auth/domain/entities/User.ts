import { Role, EstadoUsuario } from '@prisma/client';

export interface UserRecord {
  id: string;
  email: string;
  nombre: string;
  telefono?: string | null;
  direccion?: string | null;
  tipoDocumento?: string | null;
  numeroDocumento?: string | null;
  role: Role;
  estado: EstadoUsuario;
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
}

export interface AuthUser {
  id: string;
  email: string;
  nombre: string;
  role: Role;
  permissions: string[];
}
