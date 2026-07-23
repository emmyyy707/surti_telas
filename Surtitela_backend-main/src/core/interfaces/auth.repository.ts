import { PublicUser, UserEntity } from "../domain/user.js";

export interface AuthRepository {
  findUserByEmail(email: string): Promise<(UserEntity & { roles?: { name: string } | null }) | null>;
  createUser(data: { 
    name: string; 
    last_name: string; 
    email: string; 
    password: string; 
    phone?: string | null; 
    document_type?: string | null;
    document_number?: string | null;
    id_document_type?: number | null; 
    id_role?: number | null;
    email_verified?: boolean;
    email_verification_token?: string | null;
  }): Promise<UserEntity | null>;
  findUserById(id_user: number): Promise<(UserEntity & { roles?: { name: string } | null }) | null>;
  getRoleIdByName(name: string): Promise<number | null>;
}

export type AuthResult = {
  user: PublicUser & { role: string; document_type?: string | null; document_number?: string | null };
  token: string;
  refreshToken: string;
};
