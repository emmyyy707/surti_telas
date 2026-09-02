export interface PublicUser {
  id: string;
  email: string;
  nombre: string;
  apellidos?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  tipoDocumento?: string | null;
  numeroDocumento?: string | null;
  role: string;
  estado: 'ACTIVO' | 'INACTIVO';
  createdAt: Date;
  permissions?: string[];
  specificPermissions?: string[];
  avatar?: string | null;
}
