import { Role, EstadoUsuario } from '@prisma/client';

export interface PublicUser {
  id: string;
  email: string;
  nombre: string;
  telefono?: string | null;
  role: Role;
  estado: EstadoUsuario;
  createdAt: Date;
  permissions?: string[];
}
