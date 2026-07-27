import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "asesor@surtitelas.com";
  const hash = await bcrypt.hash("SurtiTelas2025*", 12);
  const updated = await prisma.user.update({
    where: { email },
    data: { passwordHash: hash },
  });
  console.log(`Asesor ${updated.email} actualizado con password SurtiTelas2025*`);
  const ok = await bcrypt.compare("SurtiTelas2025*", updated.passwordHash);
  console.log("verify SurtiTelas2025*:", ok);
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());