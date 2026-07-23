export type UserEntity = {
  id_user: number;
  name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  company?: string | null;
  googleId?: string | null;
  provider?: string | null;
  avatar?: string | null;
  document_type?: string | null;
  document_number?: string | null;
  password?: string;
  status?: boolean | null;
  email_verified?: boolean | null;
  id_document_type?: number | null;
  id_role?: number | null;
  role?: string;
  lastLogin?: Date | null;
};

export type PublicUser = Omit<UserEntity, "password"> & { nombre: string; tel?: string | null; direccion?: string | null; empresa?: string | null };
