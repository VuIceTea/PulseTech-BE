import bcrypt from "bcrypt";
import { generateToken } from "../../utils/auth";
import { verifyToken } from "../../utils/auth";
import { AppError } from "../../utils/app-error";
import { UserResponse, CreateUserInput } from "../user/user.types";
import { prisma } from "../../lib/prisma";
import { sendVerificationEmail } from "./emailService";
import { AuthResponse } from "./auth.types";

const userPublicSelect = {
  id: true,
  email: true,
  name: true,
  phone: true,
  avatar: true,
  role: true,
  isActive: true,
  isVerified: true,
  addresses: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function loginUser(
  email: string,
  password: string,
): Promise<{ user: UserResponse; token: string }> {
  if (!email || typeof email !== "string") {
    throw new AppError("Email is required", 400);
  }

  if (!password || typeof password !== "string") {
    throw new AppError("Password is required", 400);
  }
  const user = await prisma.user.findFirst({
    where: { email },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError("Invalid email or password", 401);
  }

  if (user.role === "CUSTOMER" && !user.isVerified) {
    throw new AppError("Account is not verified", 403);
  }

  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      isActive: user.isActive,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    token,
  };
}

export async function registerUser(
  input: CreateUserInput,
): Promise<AuthResponse> {
  const existing = await prisma.user.findFirst({
    where: { email: input.email },
    select: { id: true },
  });

  if (existing) {
    throw new AppError("Email already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(input.password, 10);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      password: hashedPassword,
      ...(input.name ? { name: input.name } : {}),
      ...(input.phone ? { phone: input.phone } : {}),
      ...(input.avatar ? { avatar: input.avatar } : {}),
      role: "CUSTOMER",
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      isVerified: false,
    },
    select: userPublicSelect,
  });
  const token = generateToken({
    userId: user.id,
    email: user.email,
  });
  const verificationLink = `${process.env.CLIENT_URL}/api/auth/verify-email?token=${token}`;
  try {
    await sendVerificationEmail(user.email, verificationLink);
  } catch (error) {
    await prisma.user.delete({ where: { id: user.id } });
    throw new AppError("Failed to send verification email", 502);
  }
  return {
    data: {
      user,
      token,
    },
    message:
      "Registration successful. Please check your email to verify your account.",
  };
}

export async function verifyEmail(token: string): Promise<UserResponse> {
  if (!token || typeof token !== "string") {
    throw new AppError("Verification token is required", 400);
  }

  const payload = verifyToken(token) as { userId?: string; email?: string };

  if (!payload.userId || !payload.email) {
    throw new AppError("Invalid verification token", 400);
  }

  const user = await prisma.user.findFirst({
    where: {
      id: payload.userId,
      email: payload.email,
    },
    select: userPublicSelect,
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.isVerified) {
    return user;
  }

  return prisma.user.update({
    where: { id: user.id },
    data: { isVerified: true },
    select: userPublicSelect,
  });
}

export async function getProfile(userId: string): Promise<UserResponse> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: userPublicSelect,
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
}
