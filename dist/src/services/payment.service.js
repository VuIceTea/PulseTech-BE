import crypto from "crypto";
import fetch from "node-fetch";
import env from "../config/env";
import { VNPay, HashAlgorithm, ignoreLogger, ProductCode, VnpLocale } from "vnpay";
function normalizeIpAddr(raw) {
    const value = (raw || "127.0.0.1").trim();
    if (!value || value === "::1" || value === "::ffff:127.0.0.1") {
        return "127.0.0.1";
    }
    if (value.startsWith("::ffff:")) {
        return value.slice(7);
    }
    return value;
}
function resolveVnpayHost() {
    const configured = env.VNPAY_URL.trim();
    if (!configured)
        return "https://sandbox.vnpayment.vn";
    try {
        return new URL(configured).origin;
    }
    catch {
        return "https://sandbox.vnpayment.vn";
    }
}
const vnpay = new VNPay({
    tmnCode: env.VNPAY_TMN_CODE,
    secureSecret: env.VNPAY_HASH_SECRET,
    vnpayHost: resolveVnpayHost(),
    testMode: env.NODE_ENV !== "production",
    hashAlgorithm: HashAlgorithm.SHA512,
    enableLog: env.NODE_ENV !== "production",
    loggerFn: ignoreLogger,
});
export async function createVnpayPaymentUrl(opts) {
    if (!env.VNPAY_TMN_CODE || !env.VNPAY_HASH_SECRET) {
        throw new Error("VNPAY config missing");
    }
    const returnUrl = env.VNPAY_RETURN_URL ||
        `${process.env.CLIENT_URL || "http://localhost:5000"}/api/orders/vnpay/return`;
    const ipAddr = normalizeIpAddr(opts.ipAddr);
    const amount = Math.round(opts.amount);
    if (amount <= 0) {
        throw new Error("Invalid VNPAY amount");
    }
    const paymentUrl = vnpay.buildPaymentUrl({
        vnp_Amount: amount,
        vnp_IpAddr: ipAddr,
        vnp_ReturnUrl: returnUrl,
        vnp_TxnRef: opts.reference,
        vnp_OrderInfo: `Thanh toan don hang ${opts.reference}`,
        vnp_OrderType: ProductCode.Other,
        vnp_Locale: VnpLocale.VN,
    });
    if (!paymentUrl.includes("vnp_IpAddr=")) {
        throw new Error("VNPAY payment URL missing required vnp_IpAddr");
    }
    return paymentUrl;
}
export async function createMomoPaymentUrl(opts) {
    const endpoint = env.MOMO_ENDPOINT;
    const partnerCode = env.MOMO_PARTNER_CODE;
    const accessKey = env.MOMO_ACCESS_KEY;
    const secretKey = env.MOMO_SECRET_KEY;
    const returnUrl = env.MOMO_RETURN_URL || `${process.env.CLIENT_URL || ""}/payment-return`;
    if (!endpoint || !partnerCode || !accessKey || !secretKey) {
        throw new Error("MOMO config missing");
    }
    const requestId = `${partnerCode}${Date.now()}`;
    const orderId = opts.reference;
    const amount = String(Math.round(opts.amount));
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&orderId=${orderId}&orderInfo=Payment for ${orderId}&partnerCode=${partnerCode}&requestId=${requestId}&returnUrl=${returnUrl}`;
    const signature = crypto
        .createHmac("sha256", secretKey)
        .update(rawSignature)
        .digest("hex");
    const body = {
        partnerCode,
        accessKey,
        requestId,
        orderId,
        amount,
        orderInfo: `Thanh toan don hang ${orderId}`,
        returnUrl,
        notifyUrl: returnUrl,
        extraData: "",
        signature,
    };
    const resp = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    const json = await resp.json();
    if (!json)
        throw new Error("MOMO payment creation failed");
    const payUrl = json.payUrl ||
        json.payUrlRedirect ||
        json.data?.payUrl ||
        json.data?.payUrlRedirect;
    if (!payUrl)
        throw new Error("MOMO payment creation failed: no payUrl");
    return payUrl;
}
export async function createBankPaymentInfo(order) {
    return {
        instructions: env.BANK_ACCOUNT_INFO ||
            "Please transfer to the provided bank account and include order code in description.",
        orderCode: order.orderCode,
        amount: order.finalAmount,
    };
}
//# sourceMappingURL=payment.service.js.map