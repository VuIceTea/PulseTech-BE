import dotenv from "dotenv";
import path from "node:path";

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT) || 5000,

  // Database
  DATABASE_URL: process.env.DATABASE_URL || "",

  // JWT
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",

  // Email
  EMAIL_HOST: process.env.EMAIL_HOST || "",
  EMAIL_PORT: Number(process.env.EMAIL_PORT) || 587,

  // Redis
  REDIS_URL: process.env.REDIS_URL || "",
} as const;

if (!env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

if (!env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

export default env;
