import { UserEntity } from "../domain/user.js";

export interface UsersRepository {
  getAllUsers(): Promise<UserEntity[]>;
  findUserByEmail(email: string): Promise<(UserEntity & { roles?: { name: string } | null }) | null>;
  getUserById(id_user: number): Promise<UserEntity | null>;
  isPrincipalAdminById(id_user: number): Promise<boolean>;
  isPrincipalAdminEmail(email: string): boolean;
  ensureRoleByName(name: string): Promise<number>;
  ensureDefaultRolesAndUsers(): Promise<void>;
  createUser(data: {
    name: string;
    last_name: string;
    email: string;
    password: string;
    phone?: string | null;
    address?: string | null;
    id_document_type?: number | null;
    id_role?: number | null;
    email_verified?: boolean;
    email_verification_token?: string | null;
  }): Promise<UserEntity>;
  updateUser(id_user: number, data: {
    name?: string;
    last_name?: string;
    email?: string;
    password?: string;
    phone?: string | null;
    address?: string | null;
    status?: boolean;
    id_role?: number | null;
  }): Promise<UserEntity>;
  deleteUser(id_user: number): Promise<void>;
  resetUsers(adminEmail: string | undefined): Promise<{ count: number }>;
  findUserByRoleId(roleId: number): Promise<UserEntity | null>;
  getRoleIdByName(name: string): Promise<number | null>;
}