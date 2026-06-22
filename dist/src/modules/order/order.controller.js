import { orderService } from "./order.service";
import { cartService } from "../cart/cart.service";
import { createVnpayPaymentUrl, createMomoPaymentUrl, createBankPaymentInfo, } from "../../services/payment.service";
import env from "../../config/env";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/app-error";
import { CreateOrderDto, UpdateOrderStatusDto } from "./dto/create-order.dto";
function getStatusCode(error, fallback) {
    return error instanceof AppError ? error.statusCode : fallback;
}
function parseOrderId(value) {
    if (typeof value !== "string" || !value.trim()) {
        throw new AppError("Invalid order id", 400);
    }
    return value.trim();
}
/**
 * Customer: Create order from cart
 */
export const createOrderHandler = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const cartId = (req.cookies && req.cookies.cartId) ||
            req.headers["x-cart-id"] ||
            req.body?.cartId;
        if (cartId) {
            try {
                await cartService.mergeGuestCartToUser(userId, cartId);
            }
            catch (err) { }
        }
        const parsed = CreateOrderDto.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: parsed.error.issues[0]?.message ?? "Invalid order payload",
            });
        }
        const order = await orderService.createOrder(userId, parsed.data);
        const pm = parsed.data.paymentMethod || "COD";
        if (pm !== "COD") {
            try {
                let paymentUrl = null;
                let bankInfo = null;
                const amt = Number(order.finalAmount || order.totalAmount || 0);
                const ref = order.orderCode;
                if (pm === "VNPAY") {
                    let ipAddr = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip || "127.0.0.1";
                    if (ipAddr === "::1" || ipAddr === "::ffff:127.0.0.1") {
                        ipAddr = "127.0.0.1";
                    }
                    paymentUrl = await createVnpayPaymentUrl({
                        amount: amt,
                        reference: ref,
                        ipAddr,
                    });
                }
                if (pm === "MOMO")
                    paymentUrl = await createMomoPaymentUrl({
                        amount: amt,
                        reference: ref,
                    });
                if (pm === "BANK")
                    bankInfo = await createBankPaymentInfo({
                        orderCode: ref,
                        finalAmount: amt,
                    });
                return res.status(201).json({ data: order, paymentUrl, bankInfo });
            }
            catch (err) {
                return res.status(201).json({ data: order, paymentError: String(err) });
            }
        }
        res.status(201).json({ data: order });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(getStatusCode(error, 400)).json({ message });
    }
};
/**
 * Customer: Get my orders
 */
export const getMyOrdersHandler = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const result = await orderService.getUserOrders(userId, { page, limit });
        res.status(200).json(result);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(getStatusCode(error, 400)).json({ message });
    }
};
/**
 * Customer: Get order details
 */
export const getOrderHandler = async (req, res) => {
    try {
        const orderId = parseOrderId(req.params.id);
        const userId = req.user?.userId || req.user?.id;
        const order = await orderService.getOrder(orderId, userId);
        res.status(200).json({ data: order });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(getStatusCode(error, 404)).json({ message });
    }
};
/**
 * Customer: Cancel order
 */
export const cancelOrderHandler = async (req, res) => {
    try {
        const orderId = parseOrderId(req.params.id);
        const userId = req.user?.userId || req.user?.id;
        // Verify user owns this order
        await orderService.getOrder(orderId, userId);
        const order = await orderService.cancelOrder(orderId);
        res.status(200).json({ data: order });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(getStatusCode(error, 400)).json({ message });
    }
};
/**
 * Admin: Get all orders
 */
export const getAllOrdersHandler = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const status = req.query.status;
        const userId = req.query.userId;
        const options = {
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
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(getStatusCode(error, 400)).json({ message });
    }
};
/**
 * Admin: Update order status
 */
export const updateOrderStatusHandler = async (req, res) => {
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
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(getStatusCode(error, 400)).json({ message });
    }
};
/**
 * Admin: Get order details
 */
export const getOrderDetailsHandler = async (req, res) => {
    try {
        const orderId = parseOrderId(req.params.id);
        const order = await orderService.getOrder(orderId);
        res.status(200).json({ data: order });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(getStatusCode(error, 404)).json({ message });
    }
};
/**
 * VNPAY return handler
 */
export const vnpayReturnHandler = async (req, res) => {
    try {
        const query = req.query;
        const vnpSecureHash = query.vnp_SecureHash || query.vnp_SecureHash || "";
        // verify signature
        const secret = env.VNPAY_HASH_SECRET;
        const data = {};
        Object.keys(query).forEach((k) => {
            if (k === "vnp_SecureHash" || k === "vnp_SecureHashType")
                return;
            const v = query[k];
            if (v !== undefined && v !== null)
                data[k] = String(v);
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
        const orderCode = query.vnp_TxnRef;
        const rspCode = query.vnp_ResponseCode;
        if (!orderCode)
            return res.status(400).send("Missing order reference");
        if (hash !== (vnpSecureHash || "")) {
            return res.status(400).send("Invalid signature");
        }
        // Find payment by intent id
        const intentId = orderCode;
        const payment = await prisma.payment.findUnique({
            where: { paymentIntentId: intentId },
        });
        if (!payment)
            return res.status(404).send("Payment intent not found");
        const txnId = query.vnp_TransactionNo
            ? String(query.vnp_TransactionNo)
            : null;
        if (payment.orderId) {
            if (rspCode === "00") {
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
                        where: { id: payment.orderId },
                        data: { paymentStatus: "PAID" },
                    });
                });
                const redirect = env.VNPAY_RETURN_URL || "/";
                return res.redirect(`${redirect}?status=success&intent=${intentId}`);
            }
            await prisma.payment.update({
                where: { id: payment.id },
                data: { status: "FAILED" },
            });
            await prisma.order.update({
                where: { id: payment.orderId },
                data: { paymentStatus: "FAILED" },
            });
            const redirect = env.VNPAY_RETURN_URL || "/";
            return res.redirect(`${redirect}?status=failed&intent=${intentId}`);
        }
        const snapshot = payment.cartSnapshot;
        if (rspCode === "00") {
            const newOrder = await orderService.createOrderFromSnapshot(payment.userId ?? undefined, snapshot.addressId, snapshot.items, payment.method, true);
            await prisma.payment.update({
                where: { id: payment.id },
                data: {
                    status: "PAID",
                    paidAt: new Date(),
                    transactionId: txnId ?? null,
                    orderId: newOrder.id,
                },
            });
            const redirect = env.VNPAY_RETURN_URL || "/";
            return res.redirect(`${redirect}?status=success&orderCode=${newOrder.orderCode}`);
        }
        const failedOrder = await orderService.createOrderFromSnapshot(payment.userId ?? undefined, snapshot.addressId, snapshot.items, payment.method, false);
        await prisma.payment.update({
            where: { id: payment.id },
            data: { status: "FAILED", orderId: failedOrder.id },
        });
        const redirect = env.VNPAY_RETURN_URL || "/";
        return res.redirect(`${redirect}?status=failed&orderCode=${failedOrder.orderCode}`);
    }
    catch (err) {
        console.error("vnpay return error", err);
        res.status(500).send("Internal error");
    }
};
/**
 * VNPAY IPN/notify
 */
export const vnpayIpnHandler = async (req, res) => {
    try {
        const body = req.body;
        const vnpSecureHash = body.vnp_SecureHash || "";
        const secret = env.VNPAY_HASH_SECRET;
        const data = {};
        Object.keys(body).forEach((k) => {
            if (k === "vnp_SecureHash" || k === "vnp_SecureHashType")
                return;
            const v = body[k];
            if (v !== undefined && v !== null)
                data[k] = String(v);
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
        const intentId = body.vnp_TxnRef;
        const rspCode = body.vnp_ResponseCode;
        if (hash !== vnpSecureHash)
            return res
                .status(400)
                .json({ RspCode: 97, Message: "Invalid signature" });
        if (!intentId)
            return res
                .status(400)
                .json({ RspCode: 97, Message: "Missing order reference" });
        const payment = await prisma.payment.findUnique({
            where: { paymentIntentId: intentId },
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
                        where: { id: payment.orderId },
                        data: { paymentStatus: "PAID" },
                    });
                });
                return res.json({ RspCode: 0, Message: "Confirm Success" });
            }
            const snapshot = payment.cartSnapshot;
            const newOrder = await orderService.createOrderFromSnapshot(payment.userId ?? undefined, snapshot.addressId, snapshot.items, payment.method, true);
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
                where: { id: payment.orderId },
                data: { paymentStatus: "FAILED" },
            });
            return res.json({ RspCode: 2, Message: "Payment failed" });
        }
        const snapshot = payment.cartSnapshot;
        const failedOrder = await orderService.createOrderFromSnapshot(payment.userId ?? undefined, snapshot.addressId, snapshot.items, payment.method, false);
        await prisma.payment.update({
            where: { id: payment.id },
            data: { status: "FAILED", orderId: failedOrder.id },
        });
        return res.json({ RspCode: 2, Message: "Payment failed" });
    }
    catch (err) {
        console.error("vnpay ipn error", err);
        return res.status(500).json({ RspCode: 99, Message: "Internal error" });
    }
};
/**
 * MOMO notify
 */
export const momoNotifyHandler = async (req, res) => {
    try {
        const body = req.body;
        const orderId = body.orderId;
        const resultCode = Number(body.resultCode);
        const transId = body.transId || body.transactionId || null;
        if (!orderId)
            return res.status(400).send("Missing order reference");
        const order = await prisma.order.findUnique({
            where: { orderCode: orderId },
        });
        if (!order)
            return res.status(404).send("Order not found");
        if (resultCode === 0) {
            const txnId = transId ? String(transId) : null;
            await prisma.$transaction(async (tx) => {
                await tx.payment.updateMany({
                    where: { orderId: order.id },
                    data: {
                        status: "PAID",
                        paidAt: new Date(),
                        transactionId: txnId ?? null,
                    },
                });
                await tx.order.update({
                    where: { id: order.id },
                    data: { paymentStatus: "PAID" },
                });
            });
            return res.json({ resultCode: 0, message: "Success" });
        }
        await prisma.payment.updateMany({
            where: { orderId: order.id },
            data: { status: "FAILED" },
        });
        await prisma.order.update({
            where: { id: order.id },
            data: { paymentStatus: "FAILED" },
        });
        return res.json({ resultCode: 1, message: "Failed" });
    }
    catch (err) {
        console.error("momo notify error", err);
        return res.status(500).send("Internal error");
    }
};
/**
 * MOMO return (redirect)
 */
export const momoReturnHandler = async (req, res) => {
    try {
        const query = req.query;
        const orderId = query.orderId;
        const resultCode = Number(query.resultCode);
        const redirect = env.MOMO_RETURN_URL || "/";
        if (resultCode === 0)
            return res.redirect(`${redirect}?status=success&orderCode=${orderId}`);
        return res.redirect(`${redirect}?status=failed&orderCode=${orderId}`);
    }
    catch (err) {
        console.error("momo return error", err);
        res.status(500).send("Internal error");
    }
};
//# sourceMappingURL=order.controller.js.map