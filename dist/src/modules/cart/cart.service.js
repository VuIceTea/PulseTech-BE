import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/app-error";
import redisClient from "../../lib/redis";
export class CartService {
    /**
     * Get or create user's cart
     */
    async getOrCreateCart(userId) {
        let cart = await prisma.cart.findUnique({
            where: { userId },
        });
        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId },
            });
        }
        return cart;
    }
    /**
     * Get cart with items
     */
    async getCart(userId) {
        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                cartItems: {
                    include: {
                        productVariant: {
                            include: {
                                product: true,
                            },
                        },
                    },
                },
            },
        });
        if (!cart) {
            return null;
        }
        // Calculate cart totals
        let totalPrice = 0;
        const items = cart.cartItems.map((item) => {
            const price = Number(item.productVariant.price);
            const itemTotal = price * item.quantity;
            totalPrice += itemTotal;
            return {
                cartItemId: item.id,
                productVariantId: item.productVariant.id,
                productVariant: item.productVariant,
                quantity: item.quantity,
                itemTotal,
            };
        });
        return {
            id: cart.id,
            userId: cart.userId,
            cartItems: items,
            totalPrice,
        };
    }
    /**
     * Get guest cart from redis
     *
     */
    async getGuestCart(cartId) {
        if (!cartId)
            return { cartItems: [], totalPrice: 0 };
        const key = `cart:${cartId}`;
        const raw = await redisClient.get(key);
        const items = raw ? JSON.parse(raw) : [];
        // Get variant and product details for each item
        let totalPrice = 0;
        const detailed = await Promise.all(items.map(async (it) => {
            const variant = await prisma.productVariant.findUnique({
                where: { id: it.productVariantId },
                include: { product: true },
            });
            if (!variant)
                return null;
            const price = Number(variant.price);
            const itemTotal = price * it.quantity;
            totalPrice += itemTotal;
            return {
                id: it.productVariantId,
                productVariant: variant,
                quantity: it.quantity,
                itemTotal,
            };
        }));
        return {
            cartItems: detailed.filter(Boolean),
            totalPrice,
        };
    }
    /**
     * Add item to cart
     */
    async addToCart(userId, data) {
        // Verify product variant exists and has stock
        const variant = await prisma.productVariant.findUnique({
            where: { id: data.productVariantId },
            include: { product: true },
        });
        if (!variant) {
            throw new AppError("Product variant not found", 404);
        }
        if (variant.stock <= 0) {
            throw new AppError("Product out of stock", 400);
        }
        if (variant.stock < data.quantity) {
            throw new AppError(`Only ${variant.stock} items available in stock`, 400);
        }
        // Get or create cart
        const cart = await this.getOrCreateCart(userId);
        // Check if item already in cart
        const existingItem = await prisma.cartItem.findFirst({
            where: {
                cartId: cart.id,
                productVariantId: data.productVariantId,
            },
        });
        if (existingItem) {
            // Update quantity
            const newQuantity = existingItem.quantity + data.quantity;
            if (newQuantity > variant.stock) {
                throw new AppError(`Cannot add more. Max available: ${variant.stock}`, 400);
            }
            return await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: newQuantity },
                include: { productVariant: { include: { product: true } } },
            });
        }
        else {
            // Create new cart item
            return await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productVariantId: data.productVariantId,
                    quantity: data.quantity,
                },
                include: { productVariant: { include: { product: true } } },
            });
        }
    }
    /**
     * Add item to guest cart in redis
     */
    async addToGuestCart(cartId, data) {
        if (!cartId) {
            throw new AppError("Cart id is required for guest cart", 400);
        }
        // Verify product variant exists and has stock
        const variant = await prisma.productVariant.findUnique({
            where: { id: data.productVariantId },
            include: { product: true },
        });
        if (!variant) {
            throw new AppError("Product variant not found", 404);
        }
        if (variant.stock <= 0) {
            throw new AppError("Product out of stock", 400);
        }
        // Load existing guest cart
        const key = `cart:${cartId}`;
        const raw = await redisClient.get(key);
        const items = raw ? JSON.parse(raw) : [];
        const idx = items.findIndex((i) => i.productVariantId === data.productVariantId);
        if (idx >= 0) {
            const newQuantity = items[idx].quantity + data.quantity;
            if (newQuantity > variant.stock) {
                throw new AppError(`Cannot add more. Max available: ${variant.stock}`, 400);
            }
            items[idx].quantity = newQuantity;
        }
        else {
            if (data.quantity > variant.stock) {
                throw new AppError(`Only ${variant.stock} items available in stock`, 400);
            }
            items.push({
                productVariantId: data.productVariantId,
                quantity: data.quantity,
            });
        }
        await redisClient.set(key, JSON.stringify(items));
        return {
            cartItemId: undefined,
            productVariantId: data.productVariantId,
            productVariant: variant,
            quantity: items.find((i) => i.productVariantId === data.productVariantId)
                ?.quantity,
        };
    }
    /**
     * Update cart item quantity
     */
    async updateCartItem(userId, cartItemId, data) {
        const cartItem = await prisma.cartItem.findUnique({
            where: { id: cartItemId },
            include: {
                cart: true,
                productVariant: true,
            },
        });
        if (!cartItem || cartItem.cart.userId !== userId) {
            throw new AppError("Cart item not found", 404);
        }
        if (cartItem.productVariant.stock < data.quantity) {
            throw new AppError(`Only ${cartItem.productVariant.stock} items available in stock`, 400);
        }
        const updated = await prisma.cartItem.update({
            where: { id: cartItemId },
            data: { quantity: data.quantity },
            include: { productVariant: { include: { product: true } } },
        });
        return {
            cartItemId: updated.id,
            productVariantId: updated.productVariantId,
            productVariant: updated.productVariant,
            quantity: updated.quantity,
        };
    }
    /**
     * Update guest cart item quantity
     */
    async updateGuestCartItem(cartId, productVariantId, data) {
        if (!cartId)
            throw new AppError("Cart id is required", 400);
        const key = `cart:${cartId}`;
        const raw = await redisClient.get(key);
        const items = raw ? JSON.parse(raw) : [];
        const idx = items.findIndex((i) => i.productVariantId === productVariantId);
        if (idx < 0)
            throw new AppError("Cart item not found", 404);
        const variant = await prisma.productVariant.findUnique({
            where: { id: productVariantId },
        });
        if (!variant)
            throw new AppError("Product variant not found", 404);
        if (variant.stock < data.quantity) {
            throw new AppError(`Only ${variant.stock} items available in stock`, 400);
        }
        items[idx].quantity = data.quantity;
        await redisClient.set(key, JSON.stringify(items));
        return {
            cartItemId: undefined,
            productVariantId,
            productVariant: variant,
            quantity: data.quantity,
        };
    }
    /**
     * Remove item from cart
     */
    async removeFromCart(userId, cartItemId) {
        const cartItem = await prisma.cartItem.findUnique({
            where: { id: cartItemId },
            include: { cart: true },
        });
        if (!cartItem || cartItem.cart.userId !== userId) {
            throw new AppError("Cart item not found", 404);
        }
        return await prisma.cartItem.delete({
            where: { id: cartItemId },
        });
    }
    /**
     * Remove item from guest cart
     */
    async removeFromGuestCart(cartId, productVariantId) {
        if (!cartId)
            throw new AppError("Cart id is required", 400);
        const key = `cart:${cartId}`;
        const raw = await redisClient.get(key);
        const items = raw ? JSON.parse(raw) : [];
        const newItems = items.filter((i) => i.productVariantId !== productVariantId);
        await redisClient.set(key, JSON.stringify(newItems));
        return { message: "Removed" };
    }
    /**
     * Clear all cart items
     */
    async clearCart(userId) {
        const cart = await prisma.cart.findUnique({
            where: { userId },
        });
        if (!cart) {
            throw new AppError("Cart not found", 404);
        }
        return await prisma.cartItem.deleteMany({
            where: { cartId: cart.id },
        });
    }
    /**
     * Clear guest cart
     */
    async clearGuestCart(cartId) {
        if (!cartId)
            throw new AppError("Cart id is required", 400);
        const key = `cart:${cartId}`;
        await redisClient.del(key);
        return { message: "Cleared" };
    }
    /**
     * Merge guest cart into user's DB cart. After merging, guest cart is cleared.
     */
    async mergeGuestCartToUser(userId, cartId) {
        if (!cartId)
            return;
        const key = `cart:${cartId}`;
        const raw = await redisClient.get(key);
        const items = raw ? JSON.parse(raw) : [];
        for (const it of items) {
            try {
                await this.addToCart(userId, {
                    productVariantId: it.productVariantId,
                    quantity: it.quantity,
                });
            }
            catch (err) {
                continue;
            }
        }
        await redisClient.del(key);
    }
}
export const cartService = new CartService();
//# sourceMappingURL=cart.service.js.map