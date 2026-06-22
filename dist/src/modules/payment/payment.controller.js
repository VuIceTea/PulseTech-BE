import crypto from "crypto";
import { prisma } from "../../lib/prisma";
import { cartService } from "../cart/cart.service";
import { createVnpayPaymentUrl, createMomoPaymentUrl, createBankPaymentInfo, } from "../../services/payment.service";
export const createPaymentIntentHandler = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id;
        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });
        const { cartId, paymentMethod, addressId } = req.body;
        if (!cartId)
            return res.status(400).json({ message: "cartId is required" });
        if (!paymentMethod)
            return res.status(400).json({ message: "paymentMethod is required" });
        if (!addressId)
            return res.status(400).json({ message: "addressId is required" });
        // get cart snapshot (guest or user)
        let cartSnapshot = null;
        if (cartId && cartId.includes("-")) {
            cartSnapshot = await cartService.getGuestCart(cartId);
        }
        if (!cartSnapshot ||
            !cartSnapshot.cartItems ||
            cartSnapshot.cartItems.length === 0) {
            // try user cart
            const userCart = await cartService.getCart(userId);
            if (!userCart || !userCart.cartItems || userCart.cartItems.length === 0) {
                return res.status(400).json({ message: "Cart is empty" });
            }
            cartSnapshot = userCart;
        }
        const amount = Number(cartSnapshot.totalPrice || 0);
        if (amount <= 0)
            return res.status(400).json({ message: "Invalid amount" });
        const intentId = `PI-${Date.now()}-${crypto.randomUUID().slice(0, 6)}`;
        const payment = await prisma.payment.create({
            data: {
                paymentIntentId: intentId,
                userId,
                method: paymentMethod,
                amount: amount.toString(),
                status: "PENDING",
                cartSnapshot: { items: cartSnapshot.cartItems, addressId },
            },
        });
        // generate payment url
        let paymentUrl = null;
        let bankInfo = null;
        if (paymentMethod === "VNPAY") {
            let ipAddr = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip || "127.0.0.1";
            if (ipAddr === "::1" || ipAddr === "::ffff:127.0.0.1") {
                ipAddr = "127.0.0.1";
            }
            paymentUrl = await createVnpayPaymentUrl({ amount, reference: intentId, ipAddr });
        }
        else if (paymentMethod === "MOMO") {
            paymentUrl = await createMomoPaymentUrl({ amount, reference: intentId });
        }
        else if (paymentMethod === "BANK") {
            bankInfo = await createBankPaymentInfo({
                orderCode: intentId,
                finalAmount: amount,
            });
        }
        res.status(201).json({ data: payment, paymentUrl, bankInfo });
    }
    catch (err) {
        console.error("createPaymentIntent error", err);
        res.status(500).json({ message: "Internal error" });
    }
};
export default { createPaymentIntentHandler };
//# sourceMappingURL=payment.controller.js.map