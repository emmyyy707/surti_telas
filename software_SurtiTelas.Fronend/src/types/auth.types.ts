export type UserRole =
  | "admin"
  | "almacen"
  | "asesor"
  | "domiciliario"
  | "cliente"
  | "produccion"
  | "reportes";

export interface AuthUser {
  uid: string;
  email: string | null;
  role: UserRole;
}
