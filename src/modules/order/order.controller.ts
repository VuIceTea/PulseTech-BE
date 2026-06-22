import type { RequestHandler } from "express";
import { orderService } from "./order.service";
import { cartService } from "../cart/cart.service";
import {
  createVnpayPaymentUrl,
  createMomoPaymentUrl,
  createBankPaymentInfo,
  vnpay,
} from "../payment/payment.service";
import env from "../../config/env";
import { prisma } from "../../lib/prisma";
import { VNPay } from "vnpay";
import { AppError } from "../../utils/app-error";
import { CreateOrderDto, UpdateOrderStatusDto } from "./dto/create-order.dto";

function getStatusCode(error: unknown, fallback: number): number {
  return error instanceof AppError ? error.statusCode : fallback;
}

function parseOrderId(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new AppError("Invalid order id", 400);
  }
  return value.trim();
}

/**
 * Customer: Create order from cart
 */
export const createOrderHandler: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const cartId =
      (req.cookies && req.cookies.cartId) ||
      req.headers["x-cart-id"] ||
      req.body?.cartId;
    if (cartId) {
      try {
        await cartService.mergeGuestCartToUser(userId, cartId as string);
      } catch (err) {}
    }

    const parsed = CreateOrderDto.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error.issues[0]?.message ?? "Invalid order payload",
      });
    }

    // 1. Tạo Order
    const order = await orderService.createOrder(userId, parsed.data);
    const pm = parsed.data.paymentMethod || "COD";

    // 2. Nếu là COD -> Thành công luôn
    if (pm === "COD") {
      return res.status(201).json({ data: order });
    }

    // 3. Nếu là VNPAY/MOMO/BANK -> Sinh URL thanh toán với orderCode
    try {
      let paymentUrl: string | null = null;
      let bankInfo: any = null;

      const amt = Number(order.finalAmount || 0);
      const ref = order.orderCode; // Lấy orderCode làm mã giao dịch

      if (pm === "VNPAY") {
        let ipAddr =
          (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
          req.ip ||
          "127.0.0.1";
        if (ipAddr === "::1" || ipAddr === "::ffff:127.0.0.1")
          ipAddr = "127.0.0.1";

        paymentUrl = await createVnpayPaymentUrl({
          amount: amt,
          orderCode: ref, // Truyền orderCode
          ipAddr,
        });
      } else if (pm === "MOMO") {
        paymentUrl = await createMomoPaymentUrl({
          amount: amt,
          reference: ref, // Truyền orderCode
        });
      } else if (pm === "BANK") {
        bankInfo = await createBankPaymentInfo({
          orderCode: ref,
          finalAmount: amt,
        });
      }

      // Trả về URL cho Frontend redirect
      return res.status(201).json({ data: order, paymentUrl, bankInfo });
    } catch (err) {
      // Nếu lỗi sinh URL, vẫn trả về Order (đã tạo thành công trong DB)
      return res.status(201).json({ data: order, paymentError: String(err) });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(getStatusCode(error, 400)).json({ message });
  }
};

/**
 * Customer: Get my orders
 */
export const getMyOrdersHandler: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const result = await orderService.getUserOrders(userId, { page, limit });
    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(getStatusCode(error, 400)).json({ message });
  }
};

/**
 * Customer: Get order details
 */
export const getOrderHandler: RequestHandler = async (req, res) => {
  try {
    const orderId = parseOrderId(req.params.id);
    const userId = (req as any).user?.userId || (req as any).user?.id;

    const order = await orderService.getOrder(orderId, userId);
    res.status(200).json({ data: order });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(getStatusCode(error, 404)).json({ message });
  }
};

/**
 * Customer: Cancel order
 */
export const cancelOrderHandler: RequestHandler = async (req, res) => {
  try {
    const orderId = parseOrderId(req.params.id);
    const userId = (req as any).user?.userId || (req as any).user?.id;

    // Verify user owns this order
    await orderService.getOrder(orderId, userId);

    const order = await orderService.cancelOrder(orderId);
    res.status(200).json({ data: order });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(getStatusCode(error, 400)).json({ message });
  }
};

/**
 * Admin: Get all orders
 */
export const getAllOrdersHandler: RequestHandler = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const status = req.query.status as string | undefined;
    const userId = req.query.userId as string | undefined;

    const options: {
      page?: number;
      limit?: number;
      status?: string;
      userId?: string;
    } = {
      page,
      limit,
    };

    if (status) {
      options.status = status;
    }

    if (userId) {
      options.userId = userId;
    }

    const result = await orderService.getAllOrders(options);

    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(getStatusCode(error, 400)).json({ message });
  }
};

/**
 * Admin: Update order status
 */
export const updateOrderStatusHandler: RequestHandler = async (req, res) => {
  try {
    const orderId = parseOrderId(req.params.id);
    const parsed = UpdateOrderStatusDto.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error.issues[0]?.message ?? "Invalid payload",
      });
    }

    const order = await orderService.updateOrderStatus(orderId, parsed.data);
    res.status(200).json({ data: order });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(getStatusCode(error, 400)).json({ message });
  }
};

/**
 * Admin: Get order details
 */
export const getOrderDetailsHandler: RequestHandler = async (req, res) => {
  try {
    const orderId = parseOrderId(req.params.id);
    const order = await orderService.getOrder(orderId);
    res.status(200).json({ data: order });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(getStatusCode(error, 404)).json({ message });
  }
};

/**
 * VNPAY return handler
 */
// export const vnpayReturnHandler: RequestHandler = async (req, res) => {
//   try {
//     const query = req.query as Record<string, string>;
//     const vnpSecureHash = query.vnp_SecureHash || query.vnp_SecureHash || "";
//     // verify signature
//     const secret = env.VNPAY_HASH_SECRET;
//     const data: Record<string, string> = {};
//     Object.keys(query).forEach((k) => {
//       if (k === "vnp_SecureHash" || k === "vnp_SecureHashType") return;
//       const v = query[k];
//       if (v !== undefined && v !== null) data[k] = String(v);
//     });
//     const sorted = Object.entries(data)
//       .sort(([a], [b]) => a.localeCompare(b))
//       .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
//       .join("&");
//     const crypto = await import("crypto");
//     const hash = crypto
//       .createHmac("sha512", secret)
//       .update(sorted)
//       .digest("hex");

//     const orderCode = query.vnp_TxnRef as string | undefined;
//     const rspCode = query.vnp_ResponseCode as string | undefined;

//     if (!orderCode) return res.status(400).send("Missing order reference");

//     if (hash !== (vnpSecureHash || "")) {
//       return res.status(400).send("Invalid signature");
//     }

//     // Find payment by intent id
//     const intentId = orderCode as string;
//     const payment = await prisma.payment.findUnique({
//       where: { paymentIntentId: intentId } as any,
//     });
//     if (!payment) return res.status(404).send("Payment intent not found");

//     const txnId = (query as any).vnp_TransactionNo
//       ? String((query as any).vnp_TransactionNo)
//       : null;
//     if (payment.orderId) {
//       if (rspCode === "00") {
//         await prisma.$transaction(async (tx) => {
//           await tx.payment.update({
//             where: { id: payment.id },
//             data: {
//               status: "PAID",
//               paidAt: new Date(),
//               transactionId: txnId ?? null,
//             },
//           });
//           await tx.order.update({
//             where: { id: payment.orderId! },
//             data: { paymentStatus: "PAID" },
//           });
//         });
//         const redirect = env.VNPAY_RETURN_URL || "/";
//         return res.redirect(`${redirect}?status=success&intent=${intentId}`);
//       }
//       await prisma.payment.update({
//         where: { id: payment.id },
//         data: { status: "FAILED" },
//       });
//       await prisma.order.update({
//         where: { id: payment.orderId! },
//         data: { paymentStatus: "FAILED" },
//       });
//       const redirect = env.VNPAY_RETURN_URL || "/";
//       return res.redirect(`${redirect}?status=failed&intent=${intentId}`);
//     }

//     const snapshot = (payment as any).cartSnapshot as any;
//     if (rspCode === "00") {
//       const newOrder = await orderService.createOrderFromSnapshot(
//         (payment as any).userId ?? undefined,
//         snapshot.addressId,
//         snapshot.items,
//         payment.method,
//         true,
//       );
//       await prisma.payment.update({
//         where: { id: payment.id },
//         data: {
//           status: "PAID",
//           paidAt: new Date(),
//           transactionId: txnId ?? null,
//           orderId: newOrder.id,
//         },
//       });
//       const redirect = env.VNPAY_RETURN_URL || "/";
//       return res.redirect(
//         `${redirect}?status=success&orderCode=${newOrder.orderCode}`,
//       );
//     }

//     const failedOrder = await orderService.createOrderFromSnapshot(
//       (payment as any).userId ?? undefined,
//       snapshot.addressId,
//       snapshot.items,
//       payment.method,
//       false,
//     );
//     await prisma.payment.update({
//       where: { id: payment.id },
//       data: { status: "FAILED", orderId: failedOrder.id },
//     });
//     const redirect = env.VNPAY_RETURN_URL || "/";
//     return res.redirect(
//       `${redirect}?status=failed&orderCode=${failedOrder.orderCode}`,
//     );
//   } catch (err) {
//     console.error("vnpay return error", err);
//     res.status(500).send("Internal error");
//   }
// };

/**
 * VNPAY Return Handler
 */
/**
 * VNPAY Return Handler
 */
export const vnpayReturnHandler: RequestHandler = async (req, res) => {
  try {
    const verify = vnpay.verifyReturnUrl(req.query as any);

    const txnRef = String(req.query.vnp_TxnRef || ""); // Đây sẽ là PI-...
    const orderInfo = String(req.query.vnp_OrderInfo || ""); // Đây sẽ là "Thanh toan don hang ORD-..."

    if (!txnRef) {
      return res.status(400).send("Missing order reference");
    }

    const txnId = req.query.vnp_TransactionNo
      ? String(req.query.vnp_TransactionNo)
      : null;

    // Trích xuất orderCode từ chuỗi vnp_OrderInfo
    let orderCode: string | null = null;
    if (orderInfo.startsWith("Thanh toan don hang ")) {
      orderCode = orderInfo.replace("Thanh toan don hang ", "").trim();
    }

    let order = null;

    // 1. Ưu tiên tìm kiếm bằng orderCode nếu có
    if (orderCode) {
      order = await prisma.order.findUnique({
        where: { orderCode },
        include: { payments: true },
      });
    }

    // 2. Nếu không tìm thấy Order bằng orderCode (trường hợp tạo Payment Intent trước),
    // ta tìm Payment bằng TxnRef (intentId) để lấy Order liên quan.
    if (!order) {
      const payment = await prisma.payment.findUnique({
        where: { paymentIntentId: txnRef },
        include: { order: true },
      });

      if (payment?.order) {
        order = await prisma.order.findUnique({
          where: { id: payment.order.id },
          include: { payments: true },
        });
      } else if (payment?.cartSnapshot && verify.isSuccess) {
        // Trường hợp Order chưa được tạo (vì khách thanh toán ngay từ bước Payment Intent)
        const snapshot = payment.cartSnapshot as any;
        const newOrder = await orderService.createOrderFromSnapshot(
          payment.userId || undefined,
          snapshot.addressId,
          snapshot.items,
          payment.method,
          true,
          payment.id,
        );

        // Cập nhật txnId vào Payment
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "PAID",
            paidAt: new Date(),
            transactionId: txnId,
          },
        });

        return res.redirect(`/payment-success?orderCode=${newOrder.orderCode}`);
      }
    }

    if (!order) {
      return res.status(404).send("Order not found");
    }

    // Lấy payment liên quan đến order
    const payment = order.payments[0];
    if (!payment)
      return res.status(404).send("Payment not found for this order");

    if (verify.isSuccess) {
      // ==================== THANH TOÁN THÀNH CÔNG ====================
      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: "PAID",
            paidAt: new Date(),
            transactionId: txnId,
          },
        });
        await tx.order.update({
          where: { id: order.id },
          data: { paymentStatus: "PAID", status: "PROCESSING" },
        });
      });

      return res.redirect(`/payment-success?orderCode=${order.orderCode}`);
    } else {
      // ==================== THANH TOÁN THẤT BẠI / HỦY ====================
      console.log("❌ VNPAY Payment Failed or Cancelled");

      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: "FAILED" },
        });
        await tx.order.update({
          where: { id: order.id },
          data: { paymentStatus: "FAILED", status: "FAILED" },
        });
      });

      return res.redirect(`/payment-failed?orderCode=${order.orderCode}`);
    }
  } catch (err) {
    console.error("vnpay return error", err);
    res.status(500).send("Internal error");
  }
};

/**
 * VNPAY IPN/notify
 */
export const vnpayIpnHandler: RequestHandler = async (req, res) => {
  try {
    const body = req.body as Record<string, string>;
    const vnpSecureHash = body.vnp_SecureHash || "";
    const secret = env.VNPAY_HASH_SECRET;
    const data: Record<string, string> = {};
    Object.keys(body).forEach((k) => {
      if (k === "vnp_SecureHash" || k === "vnp_SecureHashType") return;
      const v = body[k];
      if (v !== undefined && v !== null) data[k] = String(v);
    });
    const sorted = Object.entries(data)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");
    const crypto = await import("crypto");
    const hash = crypto
      .createHmac("sha512", secret)
      .update(sorted)
      .digest("hex");

    const intentId = body.vnp_TxnRef as string | undefined;
    const rspCode = body.vnp_ResponseCode as string | undefined;
    if (hash !== vnpSecureHash)
      return res
        .status(400)
        .json({ RspCode: 97, Message: "Invalid signature" });
    if (!intentId)
      return res
        .status(400)
        .json({ RspCode: 97, Message: "Missing order reference" });

    const payment = await prisma.payment.findUnique({
      where: { paymentIntentId: intentId } as any,
    });
    if (!payment)
      return res
        .status(404)
        .json({ RspCode: 1, Message: "Payment intent not found" });

    const txnId = body.vnp_TransactionNo
      ? String(body.vnp_TransactionNo)
      : null;
    if (rspCode === "00") {
      // if already linked
      if (payment.orderId) {
        await prisma.$transaction(async (tx) => {
          await tx.payment.update({
            where: { id: payment.id },
            data: {
              status: "PAID",
              paidAt: new Date(),
              transactionId: txnId ?? null,
            },
          });
          await tx.order.update({
            where: { id: payment.orderId! },
            data: { paymentStatus: "PAID" },
          });
        });
        return res.json({ RspCode: 0, Message: "Confirm Success" });
      }
      const snapshot = (payment as any).cartSnapshot as any;
      const newOrder = await orderService.createOrderFromSnapshot(
        (payment as any).userId ?? undefined,
        snapshot.addressId,
        snapshot.items,
        payment.method,
        true,
      );
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "PAID",
          paidAt: new Date(),
          transactionId: txnId ?? null,
          orderId: newOrder.id,
        },
      });
      return res.json({ RspCode: 0, Message: "Confirm Success" });
    }

    // failed
    if (payment.orderId) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED" },
      });
      await prisma.order.update({
        where: { id: payment.orderId! },
        data: { paymentStatus: "FAILED" },
      });
      return res.json({ RspCode: 2, Message: "Payment failed" });
    }
    const snapshot = (payment as any).cartSnapshot as any;
    const failedOrder = await orderService.createOrderFromSnapshot(
      (payment as any).userId ?? undefined,
      snapshot.addressId,
      snapshot.items,
      payment.method,
      false,
    );
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED", orderId: failedOrder.id },
    });
    return res.json({ RspCode: 2, Message: "Payment failed" });
  } catch (err) {
    console.error("vnpay ipn error", err);
    return res.status(500).json({ RspCode: 99, Message: "Internal error" });
  }
};

export const momoNotifyHandler: RequestHandler = async (req, res) => {
  try {
    const body = req.body as any;
    const orderId = body.orderId as string | undefined;
    const resultCode = Number(body.resultCode);

    if (!orderId) return res.status(400).send("Missing order reference");

    const payment = await prisma.payment.findUnique({
      where: { paymentIntentId: orderId },
    });

    if (!payment) return res.status(404).send("Payment not found");

    if (resultCode === 0) {
      // Thành công
      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: "PAID",
            paidAt: new Date(),
            transactionId: body.transId || null,
          },
        });
        if (payment.orderId) {
          await tx.order.update({
            where: { id: payment.orderId },
            data: { paymentStatus: "PAID", status: "PROCESSING" },
          });
        }
      });
      return res.json({ resultCode: 0, message: "Success" });
    } else {
      // Thất bại / Hủy
      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: "FAILED" },
        });
        if (payment.orderId) {
          await tx.order.update({
            where: { id: payment.orderId },
            data: { paymentStatus: "FAILED", status: "FAILED" },
          });
        }
      });
      return res.json({ resultCode: 1, message: "Failed" });
    }
  } catch (err) {
    console.error("momo notify error", err);
    return res.status(500).send("Internal error");
  }
};

/**
 * MOMO Return Handler - Fix hủy thanh toán
 */
export const momoReturnHandler: RequestHandler = async (req, res) => {
  try {
    const query = req.query as any;
    const orderId = query.orderId as string | undefined;
    const resultCode = Number(query.resultCode || -1); // -1 = unknown

    console.log(
      "📥 MOMO Return - orderId:",
      orderId,
      "resultCode:",
      resultCode,
    );

    if (!orderId) {
      return res.status(400).send("Missing order reference");
    }

    // Tìm payment theo orderCode (paymentIntentId)
    const payment = await prisma.payment.findUnique({
      where: { paymentIntentId: orderId },
    });

    if (!payment) {
      console.log("⚠️ Payment not found for MOMO return");
      return res.redirect(`/payment-failed?orderCode=${orderId}`);
    }

    if (resultCode === 0) {
      // === THANH TOÁN THÀNH CÔNG ===
      if (payment.orderId) {
        await prisma.$transaction(async (tx) => {
          await tx.payment.update({
            where: { id: payment.id },
            data: {
              status: "PAID",
              paidAt: new Date(),
              transactionId: query.transId || null,
            },
          });
          await tx.order.update({
            where: { id: payment.orderId! },
            data: { paymentStatus: "PAID", status: "PROCESSING" },
          });
        });
      } else {
        const snapshot = payment.cartSnapshot as any;
        if (snapshot?.addressId && snapshot?.items) {
          await orderService.createOrderFromSnapshot(
            payment.userId || undefined,
            snapshot.addressId,
            snapshot.items,
            payment.method,
            true,
            payment.id,
          );
        }
      }

      return res.redirect(`/payment-success?orderCode=${orderId}`);
    } else {
      console.log("❌ MOMO Payment Failed or Cancelled");

      if (payment.orderId) {
        await prisma.$transaction(async (tx) => {
          await tx.payment.update({
            where: { id: payment.id },
            data: { status: "FAILED" },
          });
          await tx.order.update({
            where: { id: payment.orderId! },
            data: { paymentStatus: "FAILED", status: "FAILED" },
          });
        });
      } else {
        const snapshot = payment.cartSnapshot as any;
        if (snapshot?.addressId && snapshot?.items) {
          await orderService.createOrderFromSnapshot(
            payment.userId || undefined,
            snapshot.addressId,
            snapshot.items,
            payment.method,
            false,
            payment.id,
          );
        }
      }

      return res.redirect(`/payment-failed?orderCode=${orderId}`);
    }
  } catch (err) {
    console.error("momo return error", err);
    res.status(500).send("Internal error");
  }
};
