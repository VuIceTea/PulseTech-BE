import crypto from "crypto";
import fetch from "node-fetch";
import env from "../../config/env";
import {
  VNPay,
  HashAlgorithm,
  ignoreLogger,
  ProductCode,
  VnpLocale,
} from "vnpay";

function normalizeIpAddr(raw?: string): string {
  const value = (raw || "127.0.0.1").trim();
  if (!value || value === "::1" || value === "::ffff:127.0.0.1") {
    return "127.0.0.1";
  }
  if (value.startsWith("::ffff:")) {
    return value.slice(7);
  }
  return value;
}

function resolveVnpayHost(): string {
  const configured = env.VNPAY_URL.trim();
  if (!configured) return "https://sandbox.vnpayment.vn";
  try {
    return new URL(configured).origin;
  } catch {
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

export async function createVnpayPaymentUrl(opts: {
  amount: number;
  orderCode: string; // Đổi thành orderCode
  ipAddr?: string;
}) {
  if (!env.VNPAY_TMN_CODE || !env.VNPAY_HASH_SECRET) {
    throw new Error("VNPAY config missing");
  }

  const returnUrl =
    env.VNPAY_RETURN_URL ||
    `${process.env.CLIENT_URL || "http://localhost:5000"}/api/orders/vnpay/return`;

  const ipAddr = normalizeIpAddr(opts.ipAddr);
  const amount = Math.round(opts.amount);
  if (amount <= 0) {
    throw new Error("Invalid VNPAY amount");
  }

  // Dùng orderCode làm TxnRef
  const txnRef = opts.orderCode;

  const paymentUrl = vnpay.buildPaymentUrl({
    vnp_Amount: amount,
    vnp_IpAddr: ipAddr,
    vnp_ReturnUrl: returnUrl,
    vnp_TxnRef: txnRef,
    vnp_OrderInfo: `Thanh toan don hang ${opts.orderCode}`,
    vnp_OrderType: ProductCode.Other,
    vnp_Locale: VnpLocale.VN,
  });

  if (!paymentUrl.includes("vnp_IpAddr=")) {
    throw new Error("VNPAY payment URL missing required vnp_IpAddr");
  }

  return paymentUrl;
}

export async function createMomoPaymentUrl(opts: {
  amount: number;
  reference: string;
}) {
  const endpoint = env.MOMO_ENDPOINT;
  const partnerCode = env.MOMO_PARTNER_CODE;
  const accessKey = env.MOMO_ACCESS_KEY;
  const secretKey = env.MOMO_SECRET_KEY;

  const returnUrl =
    env.MOMO_RETURN_URL ||
    `${process.env.CLIENT_URL || "http://localhost:5000"}/payment-success`;

  if (!endpoint || !partnerCode || !accessKey || !secretKey) {
    throw new Error("MOMO config missing in .env");
  }

  const requestId = `MOMO${Date.now()}`;
  const orderId = opts.reference;
  const amountStr = String(Math.round(opts.amount));

  const rawSignature = [
    `accessKey=${accessKey}`,
    `amount=${amountStr}`,
    `extraData=`,
    `ipnUrl=${returnUrl}`,
    `orderId=${orderId}`,
    `orderInfo=Thanh toan don hang ${orderId}`,
    `partnerCode=${partnerCode}`,
    `redirectUrl=${returnUrl}`,
    `requestId=${requestId}`,
    `requestType=captureWallet`,
  ].join("&");

  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(rawSignature)
    .digest("hex");

  const body = {
    partnerCode,
    accessKey,
    requestId,
    orderId,
    amount: amountStr,
    orderInfo: `Thanh toan don hang ${orderId}`,
    returnUrl,
    redirectUrl: returnUrl,
    ipnUrl: returnUrl,
    notifyUrl: returnUrl,
    extraData: "",
    requestType: "captureWallet",
    signature,
    lang: "vi",
  };

  console.log("🚀 MOMO RAW SIGNATURE:", rawSignature);
  console.log("🚀 MOMO REQUEST BODY:", JSON.stringify(body, null, 2));

  try {
    const resp = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const json: any = await resp.json();
    console.log("📥 MOMO RESPONSE STATUS:", resp.status);
    console.log("📥 MOMO FULL RESPONSE:", JSON.stringify(json, null, 2));

    if (json.resultCode !== 0) {
      throw new Error(`MOMO Error ${json.resultCode}: ${json.message}`);
    }

    const payUrl = json.payUrl || json.data?.payUrl || json.shortLink;
    if (!payUrl) throw new Error("No payUrl returned");

    return payUrl;
  } catch (err: any) {
    console.error("❌ MOMO Error:", err.message);
    throw new Error(`MOMO payment creation failed: ${err.message}`);
  }
}

export async function createBankPaymentInfo(order: any) {
  return {
    instructions:
      env.BANK_ACCOUNT_INFO ||
      "Please transfer to the provided bank account and include order code in description.",
    orderCode: order.orderCode,
    amount: order.finalAmount,
  };
}

export { vnpay };
