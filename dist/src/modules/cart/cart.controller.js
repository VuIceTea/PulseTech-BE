import { cartService } from "./cart.service";
import { AppError } from "../../utils/app-error";
import { AddToCartDto, UpdateCartItemDto } from "./dto/cart.dto";
import { randomUUID } from "crypto";
function getCartIdFromReq(req) {
    // check header, query, body, cookies
    const header = req.headers && (req.headers["x-cart-id"] || req.headers["x-cartid"]);
    if (header)
        return header;
    if (req.query && req.query.cartId)
        return req.query.cartId;
    if (req.body && req.body.cartId)
        return req.body.cartId;
    if (req.cookies && req.cookies.cartId)
        return req.cookies.cartId;
    // fallback: parse cookie header
    const cookieHeader = req.headers && req.headers.cookie;
    if (cookieHeader && typeof cookieHeader === "string") {
        const m = cookieHeader.match(/(?:^|; )cartId=([^;]+)/);
        if (m)
            return decodeURIComponent(m[1]);
    }
    return null;
}
function getStatusCode(error, fallback) {
    return error instanceof AppError ? error.statusCode : fallback;
}
function parseId(value) {
    if (typeof value !== "string" || !value.trim()) {
        throw new AppError("Invalid id", 400);
    }
    return value.trim();
}
/**
 * Get user's cart
 */
export const getCartHandler = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id;
        if (userId) {
            const cart = await cartService.getCart(userId);
            return res
                .status(200)
                .json({ data: cart || { cartItems: [], totalPrice: 0 } });
        }
        let cartId = getCartIdFromReq(req);
        if (!cartId) {
            cartId = randomUUID();
            try {
                res.cookie("cartId", cartId, { maxAge: 1000 * 60 * 60 * 24 * 30 });
            }
            catch { }
            return res
                .status(200)
                .json({ data: { cartItems: [], totalPrice: 0 }, cartId });
        }
        const cart = await cartService.getGuestCart(cartId);
        try {
            res.cookie("cartId", cartId, { maxAge: 1000 * 60 * 60 * 24 * 30 });
        }
        catch { }
        res
            .status(200)
            .json({ data: cart || { cartItems: [], totalPrice: 0 }, cartId });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(getStatusCode(error, 400)).json({ message });
    }
};
/**
 * Add item to cart
 */
export const addToCartHandler = async (req, res) => {
    try {
        const parsed = AddToCartDto.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: parsed.error.issues[0]?.message ?? "Invalid payload",
            });
        }
        const userId = req.user?.userId || req.user?.id;
        if (userId) {
            const cartItem = await cartService.addToCart(userId, parsed.data);
            return res.status(201).json({ data: cartItem });
        }
        // guest
        let cartId = getCartIdFromReq(req);
        if (!cartId)
            cartId = randomUUID();
        // ensure cookie so browser keeps cartId for subsequent requests
        try {
            res.cookie("cartId", cartId, { maxAge: 1000 * 60 * 60 * 24 * 30 });
        }
        catch { }
        const cartItem = await cartService.addToGuestCart(cartId, parsed.data);
        res.status(201).json({ data: cartItem, cartId });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(getStatusCode(error, 400)).json({ message });
    }
};
/**
 * Update cart item quantity
 */
export const updateCartItemHandler = async (req, res) => {
    try {
        const parsed = UpdateCartItemDto.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: parsed.error.issues[0]?.message ?? "Invalid payload",
            });
        }
        const userId = req.user?.userId || req.user?.id;
        if (userId) {
            const cartItemId = parseId(req.params.id);
            const cartItem = await cartService.updateCartItem(userId, cartItemId, parsed.data);
            return res.status(200).json({ data: cartItem });
        }
        // guest: param id is productVariantId
        const productVariantId = parseId(req.params.id);
        const cartId = getCartIdFromReq(req);
        if (!cartId)
            throw new AppError("Cart id is required", 400);
        // ensure cookie
        try {
            res.cookie("cartId", cartId, { maxAge: 1000 * 60 * 60 * 24 * 30 });
        }
        catch { }
        const cartItem = await cartService.updateGuestCartItem(cartId, productVariantId, parsed.data);
        res.status(200).json({ data: cartItem });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(getStatusCode(error, 400)).json({ message });
    }
};
/**
 * Remove item from cart
 */
export const removeFromCartHandler = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id;
        if (userId) {
            const cartItemId = parseId(req.params.id);
            await cartService.removeFromCart(userId, cartItemId);
            return res.status(200).json({ message: "Removed from cart" });
        }
        const productVariantId = parseId(req.params.id);
        const cartId = getCartIdFromReq(req);
        if (!cartId)
            throw new AppError("Cart id is required", 400);
        await cartService.removeFromGuestCart(cartId, productVariantId);
        try {
            res.cookie("cartId", cartId, { maxAge: 1000 * 60 * 60 * 24 * 30 });
        }
        catch { }
        res.status(200).json({ message: "Removed from cart" });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(getStatusCode(error, 400)).json({ message });
    }
};
/**
 * Clear cart
 */
export const clearCartHandler = async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?.id;
        if (userId) {
            await cartService.clearCart(userId);
            return res.status(200).json({ message: "Cart cleared" });
        }
        const cartId = getCartIdFromReq(req);
        if (!cartId)
            throw new AppError("Cart id is required", 400);
        await cartService.clearGuestCart(cartId);
        res.status(200).json({ message: "Cart cleared" });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(getStatusCode(error, 400)).json({ message });
    }
};
//# sourceMappingURL=cart.controller.js.map