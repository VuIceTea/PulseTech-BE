import type { RequestHandler } from "express";
import { couponService } from "./coupon.service";
import {
  CreateCouponDto,
  ApplyCouponDto,
  UpdateCouponDto,
} from "./dto/coupon.dto";
import { AppError } from "../../utils/app-error";

export const createCouponHandler: RequestHandler = async (req, res) => {
  try {
    const data = CreateCouponDto.parse(req.body);
    const coupon = await couponService.createCoupon(data);
    res.status(201).json({ data: coupon });
  } catch (error) {
    const message = error instanceof AppError ? error.message : String(error);
    res.status(400).json({ message });
  }
};

export const getPublicCouponsHandler: RequestHandler = async (req, res) => {
  const coupons = await couponService.getPublicCoupons();
  res.json({ data: coupons });
};

export const applyCouponHandler: RequestHandler = async (req, res) => {
  try {
    const data = ApplyCouponDto.parse(req.body);
    const result = await couponService.applyCoupon(
      (req as any).user?.userId,
      data,
    );
    res.json({ data: result });
  } catch (error) {
    const message = error instanceof AppError ? error.message : String(error);
    res.status(400).json({ message });
  }
};

// Admin
export const getAllCouponsHandler: RequestHandler = async (req, res) => {
  const coupons = await couponService.getAllCoupons();
  res.json({ data: coupons });
};

export const updateCouponHandler: RequestHandler = async (req, res) => {
  const id = String(req.params.id);
  if (!id) return res.status(400).json({ message: "Coupon ID is required" });

  const coupon = await couponService.updateCoupon(id, req.body);
  res.json({ data: coupon });
};

export const deleteCouponHandler: RequestHandler = async (req, res) => {
  const id = String(req.params.id);
  if (!id) return res.status(400).json({ message: "Coupon ID is required" });

  await couponService.deleteCoupon(id);
  res.json({ message: "Deleted successfully" });
};

export const validateCouponHandler: RequestHandler = async (req, res) => {
  try {
    const { code, orderAmount, productIds } = req.body;

    if (!code || !orderAmount) {
      return res
        .status(400)
        .json({ message: "code và orderAmount là bắt buộc" });
    }

    const result = await couponService.applyCoupon((req as any).user?.userId, {
      code,
      orderAmount: Number(orderAmount),
      productIds: productIds || [],
    });

    res.json({
      success: true,
      message: "Mã giảm giá hợp lệ",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Mã giảm giá không hợp lệ",
    });
  }
};
