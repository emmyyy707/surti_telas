import prisma from "../../config/prisma.js";
import { UsersRepository } from "../../core/interfaces/users.repository.js";
import { UserEntity } from "../../core/domain/user.js";

export class PrismaUsersRepository implements UsersRepository {
  async getAllUsers(): Promise<UserEntity[]> {
    return prisma.users.findMany({ include: { roles: { select: { name: true } } } }) as unknown as UserEntity[];
  }

  async findUserByEmail(email: string): Promise<(UserEntity & { roles?: { name: string } | null }) | null> {
    return prisma.users.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id_user: true,
        email: true,
        password: true,
        name: true,
        last_name: true,
        phone: true,
        address: true,
        company: true,
        status: true,
        id_role: true,
        roles: { select: { name: true } },
      },
    }) as unknown as (UserEntity & { roles?: { name: string } | null }) | null;
  }

  async getUserById(id_user: number): Promise<UserEntity | null> {
    return prisma.users.findUnique({
      where: { id_user },
      include: { roles: { select: { name: true } } },
    }) as unknown as UserEntity | null;
  }

  async isPrincipalAdminById(id_user: number): Promise<boolean> {
    const user = await prisma.users.findUnique({
      where: { id_user },
      select: { email: true },
    });
    const PRINCIPAL_ADMIN_EMAIL = process.env.PRINCIPAL_ADMIN_EMAIL?.trim().toLowerCase();
    return Boolean(PRINCIPAL_ADMIN_EMAIL && user?.email.toLowerCase() === PRINCIPAL_ADMIN_EMAIL);
  }

  isPrincipalAdminEmail(email: string): boolean {
    const PRINCIPAL_ADMIN_EMAIL = process.env.PRINCIPAL_ADMIN_EMAIL?.trim().toLowerCase();
    return Boolean(PRINCIPAL_ADMIN_EMAIL && email.toLowerCase() === PRINCIPAL_ADMIN_EMAIL);
  }

  async ensureRoleByName(name: string): Promise<number> {
    const normalizedName = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    const existingRole = await prisma.roles.findFirst({
      where: { name: { equals: normalizedName, mode: "insensitive" } },
    });
    if (existingRole) return existingRole.id_role;
    const created = await prisma.roles.create({ data: { name: normalizedName, description: `${normalizedName} role` } });
    return created.id_role;
  }

  async getRoleIdByName(name: string): Promise<number | null> {
    const role = await prisma.roles.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
      select: { id_role: true },
    });
    return role ? role.id_role : null;
  }

  async ensureDefaultRolesAndUsers(): Promise<void> {
    const roleNames = ["admin", "asesor", "domiciliario", "cliente"] as const;
    for (const roleName of roleNames) {
      await this.ensureRoleByName(roleName);
    }
  }

  async createUser(data: {
    name: string;
    last_name: string;
    email: string;
    password: string;
    phone?: string | null;
    company?: string | null;
    address?: string | null;
    id_document_type?: number | null;
    id_role?: number | null;
    email_verified?: boolean;
    email_verification_token?: string | null;
  }): Promise<UserEntity> {
    const emailVerified = data.email_verified ?? false;
    const verificationToken = data.email_verification_token ?? null;

    let roleId = data.id_role;
    if (!roleId) {
      const role = await this.getRoleIdByName("cliente");
      if (role === null) {
        const createdRole = await prisma.roles.create({
          data: { name: "cliente", description: "Cliente role" },
        });
        roleId = createdRole.id_role;
      } else {
        roleId = role;
      }
    }

    return prisma.users.create({
      data: {
        name: data.name,
        last_name: data.last_name,
        email: data.email.toLowerCase(),
        password: data.password,
        phone: data.phone ?? null,
        company: data.company ?? null,
        address: data.address ?? null,
        id_document_type: data.id_document_type,
        id_role: roleId,
        email_verified: emailVerified,
        email_verification_token: verificationToken,
      },
    }) as unknown as UserEntity;
  }

  async updateUser(id_user: number, data: {
    name?: string;
    last_name?: string;
    email?: string;
    password?: string;
    phone?: string | null;
    company?: string | null;
    address?: string | null;
    status?: boolean;
    id_role?: number | null;
  }): Promise<UserEntity> {
    const updateData: Record<string, unknown> = { ...data };
    if (data.password) {
      updateData.password = data.password;
    } else {
      delete updateData.password;
    }
    if (data.email) updateData.email = data.email.toLowerCase();
    return prisma.users.update({
      where: { id_user },
      data: updateData,
    }) as unknown as UserEntity;
  }

  async deleteUser(id_user: number): Promise<void> {
    await prisma.users.delete({ where: { id_user } });
  }

  async resetUsers(adminEmail: string | undefined): Promise<{ count: number }> {
    const result = await prisma.users.deleteMany({
      where: {
        email: {
          not: adminEmail,
        },
      },
    });
    return { count: result.count };
  }

  async findUserByRoleId(roleId: number): Promise<UserEntity | null> {
    return prisma.users.findFirst({
      where: { id_role: roleId },
    }) as unknown as UserEntity | null;
  }
}