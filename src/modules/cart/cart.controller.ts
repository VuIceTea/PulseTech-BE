import type { RequestHandler } from "express";
import { cartService } from "./cart.service";
import { AppError } from "../../utils/app-error";
import { AddToCartDto, UpdateCartItemDto } from "./dto/cart.dto";
import { randomUUID } from "crypto";

function getCartIdFromReq(req: any): string | null {
  return (
    (req.headers && req.headers["x-cart-id"]) ||
    (req.query && req.query.cartId) ||
    (req.body && req.body.cartId) ||
    null
  );
}

function getStatusCode(error: unknown, fallback: number): number {
  return error instanceof AppError ? error.statusCode : fallback;
}

function parseId(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new AppError("Invalid id", 400);
  }
  return value.trim();
}

/**
 * Get user's cart
 */
export const getCartHandler: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    if (userId) {
      const cart = await cartService.getCart(userId);
      return res
        .status(200)
        .json({ data: cart || { cartItems: [], totalPrice: 0 } });
    }

    let cartId = getCartIdFromReq(req);
    if (!cartId) {
      cartId = randomUUID();
      return res
        .status(200)
        .json({ data: { cartItems: [], totalPrice: 0 }, cartId });
    }

    const cart = await cartService.getGuestCart(cartId);
    res
      .status(200)
      .json({ data: cart || { cartItems: [], totalPrice: 0 }, cartId });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(getStatusCode(error, 400)).json({ message });
  }
};

/**
 * Add item to cart
 */
export const addToCartHandler: RequestHandler = async (req, res) => {
  try {
    const parsed = AddToCartDto.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error.issues[0]?.message ?? "Invalid payload",
      });
    }

    const userId = (req as any).user?.userId || (req as any).user?.id;
    if (userId) {
      const cartItem = await cartService.addToCart(userId, parsed.data);
      return res.status(201).json({ data: cartItem });
    }

    // guest
    let cartId = getCartIdFromReq(req);
    if (!cartId) cartId = randomUUID();
    const cartItem = await cartService.addToGuestCart(cartId, parsed.data);
    res.status(201).json({ data: cartItem, cartId });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(getStatusCode(error, 400)).json({ message });
  }
};

/**
 * Update cart item quantity
 */
export const updateCartItemHandler: RequestHandler = async (req, res) => {
  try {
    const parsed = UpdateCartItemDto.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error.issues[0]?.message ?? "Invalid payload",
      });
    }

    const userId = (req as any).user?.userId || (req as any).user?.id;
    if (userId) {
      const cartItemId = parseId(req.params.id);
      const cartItem = await cartService.updateCartItem(
        userId,
        cartItemId,
        parsed.data,
      );
      return res.status(200).json({ data: cartItem });
    }

    // guest
    const productVariantId = parseId(req.params.id);
    const cartItem = await cartService.updateGuestCartItem(
      productVariantId ? (getCartIdFromReq(req) as string) : "",
      productVariantId,
      parsed.data,
    );
    res.status(200).json({ data: cartItem });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(getStatusCode(error, 400)).json({ message });
  }
};

/**
 * Remove item from cart
 */
export const removeFromCartHandler: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    if (userId) {
      const cartItemId = parseId(req.params.id);
      await cartService.removeFromCart(userId, cartItemId);
      return res.status(200).json({ message: "Removed from cart" });
    }

    const productVariantId = parseId(req.params.id);
    const cartId = getCartIdFromReq(req);
    if (!cartId) throw new AppError("Cart id is required", 400);
    await cartService.removeFromGuestCart(cartId, productVariantId);
    res.status(200).json({ message: "Removed from cart" });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(getStatusCode(error, 400)).json({ message });
  }
};

/**
 * Clear cart
 */
export const clearCartHandler: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    if (userId) {
      await cartService.clearCart(userId);
      return res.status(200).json({ message: "Cart cleared" });
    }

    const cartId = getCartIdFromReq(req);
    if (!cartId) throw new AppError("Cart id is required", 400);
    await cartService.clearGuestCart(cartId);
    res.status(200).json({ message: "Cart cleared" });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(getStatusCode(error, 400)).json({ message });
  }
};
