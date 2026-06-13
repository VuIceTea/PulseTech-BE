import { RequestHandler } from "express";
import { AppError } from "../../utils/app-error";
import {
  getProfile,
  loginUser,
  registerUser,
  verifyEmail,
} from "./auth.service";
import { cartService } from "../cart/cart.service";
import { parseCreateUserBody } from "../user/user.validator";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getStatusCode(error: unknown, fallback: number): number {
  return error instanceof AppError ? error.statusCode : fallback;
}

export const loginHandler: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    const cartId = req.body.cartId || req.headers["x-cart-id"] || null;
    if (cartId) {
      try {
        await cartService.mergeGuestCartToUser(result.user.id, cartId);
      } catch (err) {
        console.error("Failed to merge guest cart ", err);
      }
    }
    res.status(200).json({ data: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(getStatusCode(error, 401)).json({ message });
  }
};

export const registerHandler: RequestHandler = async (req, res) => {
  try {
    const payload = parseCreateUserBody(req.body);
    const user = await registerUser(payload);
    res.status(201).json({ data: user });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(getStatusCode(error, 400)).json({ message });
  }
};

export const verifyEmailHandler: RequestHandler = async (req, res) => {
  try {
    const token = typeof req.query.token === "string" ? req.query.token : "";
    await verifyEmail(token);
    const clientUrl = process.env.CLIENT_URL || "";
    const redirectBase = clientUrl.replace(/\/$/, "");
    if (redirectBase) {
      return res.redirect(`${redirectBase}/verify/success`);
    }
    return res.redirect(`/verify/success`);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    const clientUrl = process.env.CLIENT_URL || "";
    const redirectBase = clientUrl.replace(/\/$/, "");
    const q = encodeURIComponent(message);
    if (redirectBase) {
      return res.redirect(`${redirectBase}/verify/fail?msg=${q}`);
    }
    return res.redirect(`/verify/fail?msg=${q}`);
  }
};

export const getProfileHandler: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await getProfile(userId);
    res.status(200).json({ data: user });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(getStatusCode(error, 400)).json({ message });
  }
};
