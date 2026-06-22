import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error("DATABASE_URL is not defined in environment variables");
}
const adapter = new PrismaPg({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});
const prisma = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development"
        ? ["query", "info", "error", "warn"]
        : ["error"],
});
export const prismaClient = prisma;
export async function connectDatabase() {
    await prismaClient.$connect();
}
process.on("beforeExit", async () => {
    await prismaClient.$disconnect();
});
export default connectDatabase;
//# sourceMappingURL=database.js.map