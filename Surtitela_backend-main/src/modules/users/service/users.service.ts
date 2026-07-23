import { UsersRepository } from "../../../core/interfaces/users.repository.js";
import { PrismaUsersRepository } from "../../../infra/prisma/prisma-users.repository.js";
import * as bcrypt from "bcrypt";
import { randomUUID } from "crypto";

const BCRYPT_SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
const PRINCIPAL_ADMIN_EMAIL = process.env.PRINCIPAL_ADMIN_EMAIL?.trim().toLowerCase();
const PRINCIPAL_ADMIN_NAME = process.env.PRINCIPAL_ADMIN_NAME?.trim() || "Admin";
const PRINCIPAL_ADMIN_LAST_NAME = process.env.PRINCIPAL_ADMIN_LAST_NAME?.trim() || "Principal";

const usersRepository = new PrismaUsersRepository();

class ProtectedPrincipalAdminError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProtectedPrincipalAdminError";
  }
}

type UserPublic = {
  id_user: number;
  name: string;
  last_name: string;
  phone?: string | null;
  email: string;
  address?: string | null;
  company?: string | null;
  status?: boolean | null;
  id_document_type?: number | null;
  id_role?: number | null;
  roles?: { name: string } | null;
};

function normalizeRoleName(name: string): string {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function generatePassword(): string {
  return `Pw-${randomUUID().slice(0, 12)}!A`;
}

function getSeedUserConfig(roleName: string) {
  const configByRole: Record<string, { envEmail: string; envPassword: string; envName: string; envLastName: string; defaultName: string; defaultLastName: string }> = {
    admin: {
      envEmail: "PRINCIPAL_ADMIN_EMAIL",
      envPassword: "PRINCIPAL_ADMIN_PASSWORD",
      envName: "PRINCIPAL_ADMIN_NAME",
      envLastName: "PRINCIPAL_ADMIN_LAST_NAME",
      defaultName: PRINCIPAL_ADMIN_NAME,
      defaultLastName: PRINCIPAL_ADMIN_LAST_NAME,
    },
    asesor: {
      envEmail: "SEED_ASESOR_EMAIL",
      envPassword: "SEED_ASESOR_PASSWORD",
      envName: "SEED_ASESOR_NAME",
      envLastName: "SEED_ASESOR_LAST_NAME",
      defaultName: "Asesor",
      defaultLastName: "Principal",
    },
    domiciliario: {
      envEmail: "SEED_DOMICILIARIO_EMAIL",
      envPassword: "SEED_DOMICILIARIO_PASSWORD",
      envName: "SEED_DOMICILIARIO_NAME",
      envLastName: "SEED_DOMICILIARIO_LAST_NAME",
      defaultName: "Domiciliario",
      defaultLastName: "Principal",
    },
    cliente: {
      envEmail: "SEED_CLIENTE_EMAIL",
      envPassword: "SEED_CLIENTE_PASSWORD",
      envName: "SEED_CLIENTE_NAME",
      envLastName: "SEED_CLIENTE_LAST_NAME",
      defaultName: "Cliente",
      defaultLastName: "Principal",
    },
  };

  const config = configByRole[roleName];
  if (!config) {
    return {
      email: `${roleName}-${randomUUID().slice(0, 8)}@local.test`,
      password: generatePassword(),
      name: roleName,
      last_name: "Usuario",
    };
  }

  const envEmail = process.env[config.envEmail]?.trim();
  const envPassword = process.env[config.envPassword]?.trim();
  const envName = process.env[config.envName]?.trim();
  const envLastName = process.env[config.envLastName]?.trim();

  return {
    email: (envEmail || `${roleName}-${randomUUID().slice(0, 8)}@local.test`).toLowerCase(),
    password: envPassword || generatePassword(),
    name: envName || config.defaultName,
    last_name: envLastName || config.defaultLastName,
  };
}

async function getAllUsers(): Promise<UserPublic[]> {
  const users = await usersRepository.getAllUsers();
  return users.map(({ password, ...rest }) => ({
    ...rest,
  })) as UserPublic[];
}

async function findUserByEmail(email: string) {
  return await usersRepository.findUserByEmail(email);
}

async function getUserById(id_user: number) {
  return await usersRepository.getUserById(id_user);
}

async function isPrincipalAdminById(id_user: number): Promise<boolean> {
  return await usersRepository.isPrincipalAdminById(id_user);
}

function isPrincipalAdminEmail(email: string): boolean {
  return usersRepository.isPrincipalAdminEmail(email);
}

async function ensureRoleByName(name: string): Promise<number> {
  return await usersRepository.ensureRoleByName(name);
}

async function ensureDefaultRolesAndUsers(): Promise<void> {
  await usersRepository.ensureDefaultRolesAndUsers();

  const roleNames = ["admin", "asesor", "domiciliario", "cliente"] as const;
  for (const roleName of roleNames) {
    const roleId = await ensureRoleByName(roleName);
    const existingUser = await usersRepository.findUserByRoleId(roleId);
    if (existingUser) continue;

    const seed = getSeedUserConfig(roleName);
    const hash = await bcrypt.hash(seed.password, BCRYPT_SALT_ROUNDS);
    await usersRepository.createUser({
      name: seed.name,
      last_name: seed.last_name,
      email: seed.email,
      password: hash,
      phone: null,
      address: null,
      id_document_type: null,
      id_role: roleId,
    });
  }
}

async function createPrincipalAdminAccount() {
  await ensureDefaultRolesAndUsers();
}

async function ensurePrincipalAdminExists() {
  await createPrincipalAdminAccount();
}

async function createUser(data: {
  name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string;
  company?: string;
  address?: string;
  id_document_type?: number;
  id_role?: number;
}): Promise<UserPublic | null> {
  try {
    const hash = await bcrypt.hash(data.password, BCRYPT_SALT_ROUNDS);
    const roleId = data.id_role ?? (await ensureRoleByName("cliente"));
    const user = await usersRepository.createUser({
      ...data,
      password: hash,
      id_role: roleId,
    });
    const { password, ...publicUser } = user;
    return publicUser as UserPublic;
  } catch (error) {
    console.error("Error in the service:", error);
    return null;
  }
}

async function updateUser(id_user: number, data: {
  name?: string;
  last_name?: string;
  email?: string;
  password?: string;
  phone?: string | null;
  address?: string | null;
  status?: boolean;
  id_role?: number | null;
}) {
  const existingUser = await usersRepository.getUserById(id_user);
  if (!existingUser) return null;

  if (isPrincipalAdminEmail(existingUser.email)) {
    if (data.status === false) {
      throw new ProtectedPrincipalAdminError("El Administrador Principal no puede ser inhabilitado.");
    }
    if (data.id_role !== undefined && data.id_role !== existingUser.id_role) {
      throw new ProtectedPrincipalAdminError("El Administrador Principal no puede cambiar de rol.");
    }
    if (data.email && data.email.toLowerCase() !== existingUser.email.toLowerCase()) {
      throw new ProtectedPrincipalAdminError("El Administrador Principal no puede cambiar su correo electrónico.");
    }
  }

  try {
    const updateData: Record<string, unknown> = { ...data };
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, BCRYPT_SALT_ROUNDS);
    } else {
      delete updateData.password;
    }
    if (data.email) updateData.email = data.email.toLowerCase();
    const user = await usersRepository.updateUser(id_user, updateData);
    const { password, ...publicUser } = user;
    return publicUser as UserPublic;
  } catch (error) {
    console.error("Error updating user:", error);
    return null;
  }
}

async function deleteUser(id_user: number): Promise<boolean> {
  const existingUser = await usersRepository.getUserById(id_user);
  if (!existingUser) return false;

  if (isPrincipalAdminEmail(existingUser.email)) {
    throw new ProtectedPrincipalAdminError("El Administrador Principal no puede ser eliminado.");
  }

  try {
    await usersRepository.deleteUser(id_user);
    return true;
  } catch (error) {
    console.error("Error deleting user:", error);
    return false;
  }
}

async function toggleUserStatus(id_user: number): Promise<UserPublic | null> {
  const user = await usersRepository.getUserById(id_user);
  if (!user) return null;
  if (isPrincipalAdminEmail(user.email)) {
    throw new ProtectedPrincipalAdminError("El Administrador Principal no puede ser toggled.");
  }
  const newStatus = !user.status;
  const updated = await usersRepository.updateUser(id_user, { status: newStatus });
  return updated as UserPublic;
}

async function resetUsers(): Promise<{ deleted: number }> {
  const adminEmail = PRINCIPAL_ADMIN_EMAIL;
  const result = await usersRepository.resetUsers(adminEmail);
  return { deleted: result.count };
}

export const usersService = {
  getAllUsers,
  findUserByEmail,
  getUserById,
  isPrincipalAdminById,
  isPrincipalAdminEmail,
  ensureRoleByName,
  ensureDefaultRolesAndUsers,
  createPrincipalAdminAccount,
  ensurePrincipalAdminExists,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  resetUsers,
};

export {
  createUser,
  findUserByEmail,
  getUserById,
  updateUser,
  ensureRoleByName,
  ensurePrincipalAdminExists,
  ensureDefaultRolesAndUsers,
};