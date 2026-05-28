import { prisma } from "../../lib/prisma";
import { AddAddressDto } from "./dto/add-address.dto";
import { AppError } from "../../utils/app-error";

export async function addAddress(userId: string, data: AddAddressDto) {
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, addresses: true },
  });

  if (!existing) {
    throw new AppError("User not found", 404);
  }

  // If user wants to set this address as default
  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({
    data: {
      userId,
      fullName: data.fullName,
      phone: data.phone,
      province: data.province,
      district: data.district,
      ward: data.ward,
      detailAddress: data.detailAddress,
      isDefault: data.isDefault,
    },
    select: {
      id: true,
      fullName: true,
      phone: true,
      province: true,
      district: true,
      ward: true,
      detailAddress: true,
      isDefault: true,
    },
  });
  return address;
}

export async function listAddresses(userId: string) {
  return prisma.address.findMany({
    where: { userId },
    orderBy: { isDefault: "desc" },
  });
}

export async function updateAddress(
  userId: string,
  addressId: string,
  data: AddAddressDto,
) {
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!existing) {
    throw new AppError("User not found", 404);
  }

  const addressExists = await prisma.address.findFirst({
    where: {
      id: addressId,
      userId,
    },
    select: { id: true },
  });

  if (!addressExists) {
    throw new AppError("Address not found", 404);
  }

  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.update({
    where: { id: addressId },
    data: {
      fullName: data.fullName,
      phone: data.phone,
      province: data.province,
      district: data.district,
      ward: data.ward,
      detailAddress: data.detailAddress,
      isDefault: data.isDefault,
    },
    select: {
      id: true,
      fullName: true,
      phone: true,
      province: true,
      district: true,
      ward: true,
      detailAddress: true,
      isDefault: true,
    },
  });
  return address;
}

export async function deleteAddress(userId: string, addressId: string) {
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!existing) {
    throw new AppError("User not found", 404);
  }

  const addressExists = await prisma.address.findFirst({
    where: {
      id: addressId,
      userId,
    },
    select: {
      id: true,
      isDefault: true,
    },
  });

  if (!addressExists) {
    throw new AppError("Address not found", 404);
  }

  await prisma.address.delete({
    where: { id: addressId },
  });
}
