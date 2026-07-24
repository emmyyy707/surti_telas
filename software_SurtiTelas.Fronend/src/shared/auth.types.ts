export type UserRole =
  | "admin"
  | "asesor"
  | "domiciliario"
  | "cliente";

export interface AuthUser {
  uid: string;
  email: string | null;
  role: UserRole;
}



