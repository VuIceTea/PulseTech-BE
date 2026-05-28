import process from "node:process";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined!");
}

const adapter = new PrismaPg({
  connectionString,
  max: 10,                    
  idleTimeoutMillis: 30000,   
  connectionTimeoutMillis: 5000,
});

const prisma = new PrismaClient({
  adapter,
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "info", "warn", "error"]
      : ["error"],
});

let prismaInstance: PrismaClient = prisma;

process.on("beforeExit", async () => {
  await prismaInstance.$disconnect();
});

export { prismaInstance as prisma };
export default prismaInstance;