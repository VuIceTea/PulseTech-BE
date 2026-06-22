import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/app-error";
import {
  CreateCouponDto,
  ApplyCouponDto,
  UpdateCouponDto,
} from "./dto/coupon.dto";

export class CouponService {
  async createCoupon(data: CreateCouponDto) {
    const existing = await prisma.coupon.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      throw new AppError("Mã giảm giá đã tồn tại", 400);
    }

    return prisma.coupon.create({
      data: {
        code: data.code,
        discountValue: data.discountValue,
        discountType: data.discountType,
        description: data.description ?? null,
        minOrderAmount: data.minOrderAmount ?? null,
        maxDiscount: data.maxDiscount ?? null,
        validFrom: new Date(data.validFrom),
        validTo: new Date(data.validTo),
        usageLimit: data.usageLimit ?? null,
        isActive: data.isActive,
        isPublic: data.isPublic,

        applicableProductIds: data.applicableProductIds
          ? (data.applicableProductIds as any)
          : Prisma.JsonNull,
      },
    });
  }

  async getPublicCoupons() {
    return prisma.coupon.findMany({
      where: {
        isActive: true,
        isPublic: true,
        validTo: { gt: new Date() },
      },
      orderBy: { validTo: "asc" },
    });
  }

  async applyCoupon(userId: string, data: ApplyCouponDto) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: data.code },
    });

    if (!coupon || !coupon.isActive) {
      throw new AppError("Mã giảm giá không hợp lệ hoặc đã hết hạn", 400);
    }

    if (new Date() > coupon.validTo) {
      throw new AppError("Mã giảm giá đã hết hạn", 400);
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new AppError("Mã giảm giá đã đạt hết lượt sử dụng", 400);
    }

    if (
      coupon.minOrderAmount &&
      data.orderAmount < Number(coupon.minOrderAmount)
    ) {
      throw new AppError(
        `Đơn hàng tối thiểu ${coupon.minOrderAmount} VND`,
        400,
      );
    }

    let discount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discount = (data.orderAmount * Number(coupon.discountValue)) / 100;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, Number(coupon.maxDiscount));
      }
    } else {
      discount = Number(coupon.discountValue);
    }

    return {
      code: coupon.code,
      discountAmount: discount,
      discountType: coupon.discountType,
      finalAmount: data.orderAmount - discount,
    };
  }

  async getAllCoupons() {
    return prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async updateCoupon(id: string, data: UpdateCouponDto) {
    const updateData: any = {};

    if (data.code !== undefined) updateData.code = data.code;
    if (data.discountValue !== undefined)
      updateData.discountValue = data.discountValue;
    if (data.discountType !== undefined)
      updateData.discountType = data.discountType;
    if (data.description !== undefined)
      updateData.description = data.description ?? null;
    if (data.minOrderAmount !== undefined)
      updateData.minOrderAmount = data.minOrderAmount ?? null;
    if (data.maxDiscount !== undefined)
      updateData.maxDiscount = data.maxDiscount ?? null;
    if (data.validFrom) updateData.validFrom = new Date(data.validFrom);
    if (data.validTo) updateData.validTo = new Date(data.validTo);
    if (data.usageLimit !== undefined)
      updateData.usageLimit = data.usageLimit ?? null;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.isPublic !== undefined) updateData.isPublic = data.isPublic;

    if (data.applicableProductIds !== undefined) {
      updateData.applicableProductIds = data.applicableProductIds
        ? (data.applicableProductIds as any)
        : Prisma.JsonNull;
    }

    return prisma.coupon.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteCoupon(id: string) {
    return prisma.coupon.delete({ where: { id } });
  }
}

export const couponService = new CouponService();
