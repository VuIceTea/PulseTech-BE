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
    const { email, password, cartId } = req.body;

    const result = await loginUser(email, password);

    if (cartId && typeof cartId === "string") {
      try {
        await cartService.mergeGuestCartToUser(result.user.id, cartId);
        console.log(`✅ Merged guest cart ${cartId} to user ${result.user.id}`);
      } catch (err) {
        console.error("Merge guest cart failed:", err);
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

    // Chuyển hướng về trang HTML success trong thư mục public
    return res.redirect(`/verify-success.html`);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    const q = encodeURIComponent(message);
    // Chuyển hướng về trang HTML fail trong thư mục public
    return res.redirect(`/verify-fail.html?msg=${q}`);
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
