import { OAuth2Client } from "google-auth-library";
import prisma from "../../../config/prisma.js";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

const BCRYPT_SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "postmessage"
);

type TokenPayload = {
  id_user: number;
  email: string;
  role: string;
  name: string;
  last_name: string;
  phone?: string | null;
  company?: string | null;
};

function buildToken(payload: TokenPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "3d" });
}

function buildRefreshToken(payload: TokenPayload) {
  const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "default_refresh_secret";
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
    empresa: payload.company,
  };
}

function buildAuthResult(payload: TokenPayload) {
  return {
    user: buildPublicUser(payload),
    token: buildToken(payload),
    refreshToken: buildRefreshToken(payload),
  };
}

async function getRoleIdByName(name: string): Promise<number | null> {
  const role = await prisma.roles.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
    select: { id_role: true },
  });
  return role ? role.id_role : null;
}

export async function googleLogin(idToken: string) {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error("No payload in Google token");
    }

    const { email, name, given_name, family_name, picture, sub } = payload;

    let user = await prisma.users.findUnique({
      where: { email: email!.toLowerCase() },
      include: { roles: { select: { name: true } } },
    });

    const roleName = "cliente";

    if (!user) {
      const roleId = await getRoleIdByName("cliente");
      if (!roleId) {
        const createdRole = await prisma.roles.create({
          data: { name: "cliente", description: "Cliente role" },
        });
        await prisma.roles.create({
          data: { name: "admin", description: "Admin role" },
        });
        await prisma.roles.create({
          data: { name: "asesor", description: "Asesor role" },
        });
        await prisma.roles.create({
          data: { name: "domiciliario", description: "Domiciliario role" },
        });
      }

      const finalRoleId = roleId ?? (await getRoleIdByName("cliente"))!;

      const displayName = name || `${given_name || ""} ${family_name || ""}`.trim();
      const nameParts = displayName.split(" ");
      const firstName = nameParts.shift() || displayName;
      const lastName = nameParts.join(" ") || "";

      user = await prisma.users.create({
        data: {
          name: firstName,
          last_name: lastName,
          email: email!.toLowerCase(),
          googleId: sub,
          provider: "google",
          avatar: picture || null,
          status: true,
          email_verified: true,
          id_role: finalRoleId,
        },
        include: { roles: { select: { name: true } } },
      });
    } else {
      const updateData: any = {
        lastLogin: new Date(),
      };

      if (!user.googleId) {
        updateData.googleId = sub;
        updateData.provider = "google";
      }

      user = await prisma.users.update({
        where: { id_user: user.id_user },
        data: updateData,
        include: { roles: { select: { name: true } } },
      });
    }

    const role = (user as any).roles?.name ?? "cliente";
    const tokenPayload: TokenPayload = {
      id_user: user.id_user,
      email: user.email,
      role,
      name: user.name,
      last_name: user.last_name,
      phone: user.phone,
      company: user.company,
    };

    return buildAuthResult(tokenPayload);
  } catch (error) {
    console.error("Google OAuth error:", error);
    return null;
  }
}