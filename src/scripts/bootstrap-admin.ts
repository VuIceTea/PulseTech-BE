import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";

const DEFAULT_ADMIN_EMAIL = "admin@pulsetech.com";
const DEFAULT_ADMIN_PASSWORD = "Admin@123456";
const DEFAULT_ADMIN_NAME = "System Administrator";

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? DEFAULT_ADMIN_EMAIL).trim();
  const password = process.env.ADMIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD;
  const name = (process.env.ADMIN_NAME ?? DEFAULT_ADMIN_NAME).trim();

  if (!email) {
    throw new Error("ADMIN_EMAIL is required");
  }

  if (!password || password.length < 6) {
    throw new Error("ADMIN_PASSWORD must be at least 6 characters");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const existing = await prisma.user.findFirst({
    where: { email },
    select: { id: true },
  });

  const user = existing
    ? await prisma.user.update({
        where: { id: existing.id },
        data: {
          password: passwordHash,
          role: "ADMIN",
          isActive: true,
          isVerified: true,
          name,
        },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          isVerified: true,
          updatedAt: true,
        },
      })
    : await prisma.user.create({
        data: {
          email,
          password: passwordHash,
          role: "ADMIN",
          isActive: true,
          isVerified: true,
          name,
        },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          isVerified: true,
          createdAt: true,
        },
      });

  console.log("Admin account is ready:");
  console.log(JSON.stringify(user, null, 2));
  console.log("Credentials for handoff:");
  console.log(`email: ${email}`);
  console.log(`password: ${password}`);
}

main()
  .catch((error) => {
    console.error("Failed to bootstrap admin account:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
