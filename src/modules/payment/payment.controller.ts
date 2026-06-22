import type { RequestHandler } from "express";
import { prisma } from "../../lib/prisma";
import { cartService } from "../cart/cart.service";
import { couponService } from "../coupon/coupon.service";
import {
  createVnpayPaymentUrl,
  createMomoPaymentUrl,
  createBankPaymentInfo,
} from "./payment.service";
import crypto from "crypto";
import { shippingService } from "../shipping/shipping.service";

export const createPaymentIntentHandler: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { paymentMethod, addressId, couponCode, shippingMethodId } = req.body;

    if (!paymentMethod || !addressId) {
      return res
        .status(400)
        .json({ message: "paymentMethod and addressId are required" });
    }

    // Lấy giỏ hàng
    const userCart = await cartService.getCart(userId);
    if (!userCart?.cartItems?.length) {
      return res.status(400).json({ message: "Giỏ hàng trống" });
    }

    let finalAmount = Number(userCart.totalPrice);
    let discountInfo = null;
    let shippingInfo = null;

    // 1. Áp dụng mã giảm giá
    if (couponCode) {
      try {
        discountInfo = await couponService.applyCoupon(userId, {
          code: couponCode,
          orderAmount: finalAmount,
          productIds: userCart.cartItems.map((i: any) => i.productVariantId),
        });
        finalAmount = discountInfo.finalAmount;
      } catch (err: any) {
        return res.status(400).json({ message: err.message });
      }
    }

    // 2. Tính phí vận chuyển
    try {
      shippingInfo = await shippingService.calculateShipping({
        addressId,
        orderAmount: finalAmount,
        shippingMethodId,
      });
      finalAmount += shippingInfo.shippingFee;
    } catch (err: any) {
      console.error("Shipping calculation error", err);
    }

    if (finalAmount < 0) finalAmount = 0;

    const intentId = `PI-${Date.now()}-${crypto.randomUUID().slice(0, 6)}`;

    const payment = await prisma.payment.create({
      data: {
        paymentIntentId: intentId,
        userId,
        method: paymentMethod,
        amount: finalAmount.toString(),
        status: "PENDING",
        cartSnapshot: {
          items: userCart.cartItems,
          addressId,
          couponCode: couponCode || null,
          discountInfo,
          shippingInfo,
        },
      },
    });

    let paymentUrl: string | null = null;
    let bankInfo: any = null;

    if (paymentMethod === "VNPAY") {
      const ipAddr =
        (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
        req.ip ||
        "127.0.0.1";

      // SỬA Ở ĐÂY: Đổi 'reference' thành 'orderCode' và truyền intentId vào
      paymentUrl = await createVnpayPaymentUrl({
        amount: finalAmount,
        orderCode: intentId,
        ipAddr,
      });
    } else if (paymentMethod === "MOMO") {
      paymentUrl = await createMomoPaymentUrl({
        amount: finalAmount,
        reference: intentId,
      });
    } else if (paymentMethod === "BANK") {
      bankInfo = await createBankPaymentInfo({
        orderCode: intentId,
        finalAmount,
      });
    }

    res.status(201).json({
      data: payment,
      paymentUrl,
      bankInfo,
      discountInfo,
      shippingInfo,
      finalAmount,
      originalAmount: Number(userCart.totalPrice),
    });
  } catch (err: any) {
    console.error("createPaymentIntent error", err);
    res.status(500).json({ message: err.message || "Internal error" });
  }
};
