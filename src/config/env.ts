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
  // VNPAY
  VNPAY_TMN_CODE: process.env.VNPAY_TMN_CODE || "",
  VNPAY_HASH_SECRET: process.env.VNPAY_HASH_SECRET || "",
  VNPAY_URL: process.env.VNPAY_URL || "",
  VNPAY_RETURN_URL: process.env.VNPAY_RETURN_URL || "",
  // MOMO
  MOMO_ENDPOINT: process.env.MOMO_ENDPOINT || "",
  MOMO_PARTNER_CODE: process.env.MOMO_PARTNER_CODE || "",
  MOMO_ACCESS_KEY: process.env.MOMO_ACCESS_KEY || "",
  MOMO_SECRET_KEY: process.env.MOMO_SECRET_KEY || "",
  MOMO_RETURN_URL: process.env.MOMO_RETURN_URL || "",
  // Bank transfer info (VietQR instructions)
  BANK_ACCOUNT_INFO: process.env.BANK_ACCOUNT_INFO || "",
} as const;

if (!env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

if (!env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

export default env;
