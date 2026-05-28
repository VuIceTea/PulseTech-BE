import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/app-error";
import { Prisma } from "../../../generated/prisma/client";
import {
  ListUsersQuery,
  ListUsersResult,
  UpdateUserInput,
  UserResponse,
} from "./user.types";

const userPublicSelect = {
  id: true,
  email: true,
  name: true,
  phone: true,
  avatar: true,
  role: true,
  isActive: true,
  isVerified: true,
  createdAt: true,
  updatedAt: true,
  addresses: true,
} as const;

export async function listUsers(
  query: ListUsersQuery,
): Promise<ListUsersResult> {
  const { page, limit, search, role, isActive } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.UserWhereInput = {
    ...(search
      ? {
          OR: [
            { email: { contains: search, mode: "insensitive" } },
            { name: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(role ? { role } : {}),
    ...(isActive !== undefined ? { isActive } : {}),
  };

  const [total, users] = await prisma.$transaction([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: userPublicSelect,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
  ]);

  return {
    data: users,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
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

export async function updateUser(
  id: string,
  input: UpdateUserInput,
): Promise<UserResponse> {
  const existing = await prisma.user.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    throw new AppError("User not found", 404);
  }

  if (input.email) {
    const duplicateEmailUser = await prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true },
    });

    if (duplicateEmailUser && duplicateEmailUser.id !== id) {
      throw new AppError("Email already exists", 409);
    }
  }

  const user = await prisma.user.update({
    where: { id },
    data: input,
    select: userPublicSelect,
  });

  return user;
}

export async function deactivateUser(id: string): Promise<UserResponse> {
  const existing = await prisma.user.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    throw new AppError("User not found", 404);
  }

  const user = await prisma.user.update({
    where: { id },
    data: { isActive: false },
    select: userPublicSelect,
  });

  return user;
}

export async function activeUser(id: string): Promise<UserResponse> {
  const existing = await prisma.user.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    throw new AppError("User not found", 404);
  }

  const user = await prisma.user.update({
    where: { id },
    data: { isActive: true },
    select: userPublicSelect,
  });
  return user;
}
