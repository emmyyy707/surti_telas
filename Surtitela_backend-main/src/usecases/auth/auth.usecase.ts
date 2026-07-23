import { AuthRepository, AuthResult } from "../../core/interfaces/auth.repository.js";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
if (!JWT_REFRESH_SECRET) {
  throw new Error("JWT_REFRESH_SECRET environment variable is required");
}
const BCRYPT_SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;

type TokenPayload = {
  id_user: number;
  email: string;
  role: string;
  name: string;
  last_name: string;
  phone?: string | null;
  document_type?: string | null;
  document_number?: string | null;
};

function buildToken(payload: TokenPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "3d" });
}

function buildRefreshToken(payload: TokenPayload) {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "7d" });
}

function buildPublicUser(payload: TokenPayload) {
  return {
    id_user: payload.id_user,
    email: payload.email,
    name: payload.name,
    last_name: payload.last_name,
    role: payload.role,
    nombre: `${payload.name} ${payload.last_name}`.trim(),
    tel: payload.phone,
    document_type: payload.document_type,
    document_number: payload.document_number,
  };
}

function buildAuthResult(payload: TokenPayload): AuthResult {
  return {
    user: buildPublicUser(payload),
    token: buildToken(payload),
    refreshToken: buildRefreshToken(payload),
  };
}

export class AuthUseCase {
  constructor(private authRepository: AuthRepository) {}

  public async login(email: string, password: string): Promise<AuthResult | null> {
    const user = await this.authRepository.findUserByEmail(email);
    if (!user) return null;
    const passwordMatches = await bcrypt.compare(password, user.password as string);
    if (!passwordMatches) return null;
    const role = (user as any).roles?.name ?? "cliente";
    const payload: TokenPayload = {
      id_user: user.id_user,
      email: user.email,
      role,
      name: user.name,
      last_name: user.last_name,
      phone: user.phone,
      document_type: user.document_type,
      document_number: user.document_number,
    };
    return buildAuthResult(payload);
  }

  public async register(data: { 
    name: string; 
    last_name: string; 
    email: string; 
    password: string; 
    phone?: string;
    document_type?: string;
    document_number?: string;
  }): Promise<AuthResult | null> {
    const existingUser = await this.authRepository.findUserByEmail(data.email);
    if (existingUser) return null;
    const hashedPassword = await bcrypt.hash(data.password, BCRYPT_SALT_ROUNDS);
    const verificationToken = randomUUID();

    const roleId = await this.authRepository.getRoleIdByName("cliente");
    if (!roleId) {
      throw new Error("Role 'cliente' not found");
    }

    const user = await this.authRepository.createUser({
      ...data,
      password: hashedPassword,
      id_role: roleId,
      email_verified: false,
      email_verification_token: verificationToken,
    });
    if (!user) return null;
    const role = "cliente";
    const payload: TokenPayload = {
      id_user: user.id_user,
      email: user.email,
      role,
      name: user.name,
      last_name: user.last_name,
      phone: user.phone,
      document_type: user.document_type,
      document_number: user.document_number,
    };
    return buildAuthResult(payload);
  }

  public async refreshToken(refreshToken: string): Promise<AuthResult | null> {
    try {
      const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as TokenPayload;
      const user = await this.authRepository.findUserByEmail(payload.email);
      if (!user || user.id_user !== payload.id_user) return null;
      const role = (user as any).roles?.name ?? "cliente";
      const tokenPayload: TokenPayload = {
        id_user: user.id_user,
        email: user.email,
        role,
        name: user.name,
        last_name: user.last_name,
        phone: user.phone,
        document_type: user.document_type,
        document_number: user.document_number,
      };
      return buildAuthResult(tokenPayload);
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}