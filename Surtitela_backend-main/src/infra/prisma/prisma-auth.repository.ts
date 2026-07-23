import prisma from "../../config/prisma.js";
import { AuthRepository } from "../../core/interfaces/auth.repository.js";
import { UserEntity } from "../../core/domain/user.js";

export class PrismaAuthRepository implements AuthRepository {
  async findUserByEmail(email: string) {
    return prisma.users.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id_user: true,
        email: true,
        password: true,
        name: true,
        last_name: true,
        phone: true,
        company: true,
        address: true,
        id_role: true,
        roles: { select: { name: true } },
      },
    });
  }

  async createUser(data: { 
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
  }) {
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
        document_type: data.document_type ?? null,
        document_number: data.document_number ?? null,
        id_document_type: data.id_document_type,
        id_role: roleId,
        email_verified: emailVerified,
        email_verification_token: verificationToken,
      },
    });
  }

  async findUserById(id_user: number) {
    return prisma.users.findUnique({
      where: { id_user },
      select: {
        id_user: true,
        email: true,
        password: true,
        name: true,
        last_name: true,
        phone: true,
        company: true,
        address: true,
        id_role: true,
        roles: { select: { name: true } },
      },
    });
  }

  async getRoleIdByName(name: string): Promise<number | null> {
    const role = await prisma.roles.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
      select: { id_role: true },
    });
    return role ? role.id_role : null;
  }
}