import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/app-error";
export class OrderService {
    /**
     * Create order from cart with inventory deduction
     */
    async createOrder(userId, data) {
        // Verify address exists and belongs to user
        const address = await prisma.address.findUnique({
            where: { id: data.addressId },
        });
        if (!address || address.userId !== userId) {
            throw new AppError("Địa chỉ không hợp lệ", 404);
        }
        // Get user's cart
        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                cartItems: {
                    include: {
                        productVariant: { include: { product: true } },
                    },
                },
            },
        });
        if (!cart || cart.cartItems.length === 0) {
            throw new AppError("Giỏ hàng trống", 400);
        }
        // Validate stock availability for all items
        for (const cartItem of cart.cartItems) {
            const variant = cartItem.productVariant;
            if (variant.stock < cartItem.quantity) {
                throw new AppError("Sản phẩm đã hết hàng", 400);
            }
        }
        // Calculate totals
        let totalAmount = 0;
        const orderItems = [];
        // Create order items and collect data
        for (const cartItem of cart.cartItems) {
            const variant = cartItem.productVariant;
            const itemPrice = Number(variant.price);
            const itemTotal = itemPrice * cartItem.quantity;
            totalAmount += itemTotal;
            orderItems.push({
                productVariantId: variant.id,
                quantity: cartItem.quantity,
                price: variant.price,
                totalPrice: itemTotal,
                productName: variant.product.name,
                variantInfo: `${variant.color || ""}${variant.storage ? " " + variant.storage : ""}${variant.ram ? " " + variant.ram : ""}`.trim(),
            });
        }
        // Generate order code
        const orderCode = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        // Create order and deduct inventory
        const order = await prisma.$transaction(async (tx) => {
            // Create order
            const newOrder = await tx.order.create({
                data: {
                    orderCode,
                    userId,
                    addressId: data.addressId,
                    note: data.note ?? null,
                    totalAmount: totalAmount.toString(),
                    finalAmount: totalAmount.toString(),
                    status: "PENDING",
                    paymentStatus: data.paymentMethod === "COD" ? "PENDING" : "PENDING",
                    orderItems: {
                        createMany: {
                            data: orderItems,
                        },
                    },
                    payments: {
                        create: {
                            method: data.paymentMethod,
                            amount: totalAmount.toString(),
                            status: "PENDING",
                        },
                    },
                },
                include: {
                    orderItems: { include: { productVariant: true } },
                    address: true,
                },
            });
            // Deduct inventory for each variant
            for (const orderItem of orderItems) {
                // Decrease variant stock
                await tx.productVariant.update({
                    where: { id: orderItem.productVariantId },
                    data: {
                        stock: {
                            decrement: orderItem.quantity,
                        },
                    },
                });
                // Get the variant to find parent product
                const variant = await tx.productVariant.findUnique({
                    where: { id: orderItem.productVariantId },
                    include: { product: true },
                });
                if (variant) {
                    // Decrease product stock
                    await tx.product.update({
                        where: { id: variant.product.id },
                        data: {
                            stock: {
                                decrement: orderItem.quantity,
                            },
                        },
                    });
                }
            }
            // Clear cart items
            await tx.cartItem.deleteMany({
                where: { cartId: cart.id },
            });
            return newOrder;
        });
        return order;
    }
    /**
     * Get orders by user
     */
    async getUserOrders(userId, options = {}) {
        const page = options.page || 1;
        const limit = options.limit || 20;
        const skip = (page - 1) * limit;
        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where: { userId },
                include: {
                    orderItems: { include: { productVariant: true } },
                    address: true,
                    payments: true,
                },
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
            prisma.order.count({ where: { userId } }),
        ]);
        return {
            orders,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    /**
     * Get single order
     */
    async getOrder(orderId, userId) {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                orderItems: {
                    include: { productVariant: { include: { product: true } } },
                },
                address: true,
                payments: true,
                user: { select: { name: true, email: true, phone: true } },
            },
        });
        if (!order) {
            throw new AppError("Đơn hàng không tồn tại", 404);
        }
        // If userId provided, verify user owns this order
        if (userId && order.userId !== userId) {
            throw new AppError("Không có quyền truy cập đơn hàng này", 403);
        }
        return order;
    }
    /**
     * Create an order from a cart snapshot (used by payment-intent flow)
     * items: array of { id: productVariantId, quantity, productVariant }
     * paid: boolean - whether payment succeeded
     */
    async createOrderFromSnapshot(userId, addressId, items, paymentMethod, paid) {
        // verify address
        const address = await prisma.address.findUnique({
            where: { id: addressId },
        });
        if (!address)
            throw new AppError("Địa chỉ không hợp lệ", 404);
        if (userId && address.userId !== userId)
            throw new AppError("Địa chỉ không thuộc user", 403);
        if (!items || items.length === 0)
            throw new AppError("Cart snapshot empty", 400);
        // build order items and totals
        let totalAmount = 0;
        const orderItemsData = [];
        for (const it of items) {
            const variantId = it.id ||
                it.productVariant?.id ||
                (it.productVariantId ? it.productVariantId : null);
            const quantity = Number(it.quantity || it.qty || 1);
            if (!variantId)
                throw new AppError("Invalid cart item in snapshot", 400);
            const variant = await prisma.productVariant.findUnique({
                where: { id: variantId },
                include: { product: true },
            });
            if (!variant)
                throw new AppError("Product variant not found", 404);
            const price = Number(variant.price);
            const itemTotal = price * quantity;
            totalAmount += itemTotal;
            orderItemsData.push({
                productVariantId: variant.id,
                quantity,
                price: variant.price,
                totalPrice: itemTotal,
                productName: variant.product.name,
                variantInfo: `${variant.color || ""}${variant.storage ? " " + variant.storage : ""}${variant.ram ? " " + variant.ram : ""}`.trim(),
            });
        }
        // generate order code
        const orderCode = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        // Transaction: create order, payment, and optionally deduct inventory
        const order = await prisma.$transaction(async (tx) => {
            const newOrder = await tx.order.create({
                data: {
                    orderCode,
                    userId: userId ?? address.userId ?? "",
                    addressId,
                    note: null,
                    totalAmount: totalAmount.toString(),
                    finalAmount: totalAmount.toString(),
                    status: paid ? "PROCESSING" : "FAILED",
                    paymentStatus: paid ? "PAID" : "FAILED",
                    orderItems: { createMany: { data: orderItemsData } },
                    payments: {
                        create: {
                            method: paymentMethod,
                            amount: totalAmount.toString(),
                            status: paid ? "PAID" : "FAILED",
                        },
                    },
                },
                include: {
                    orderItems: { include: { productVariant: true } },
                    address: true,
                },
            });
            if (paid) {
                // Deduct inventory
                for (const oi of orderItemsData) {
                    await tx.productVariant.update({
                        where: { id: oi.productVariantId },
                        data: { stock: { decrement: oi.quantity } },
                    });
                    const variant = await tx.productVariant.findUnique({
                        where: { id: oi.productVariantId },
                        include: { product: true },
                    });
                    if (variant) {
                        await tx.product.update({
                            where: { id: variant.product.id },
                            data: { stock: { decrement: oi.quantity } },
                        });
                    }
                }
                // Clear user's cart
                if (userId) {
                    await tx.cartItem.deleteMany({ where: { cart: { userId } } });
                }
            }
            return newOrder;
        });
        return order;
    }
    /**
     * Admin: Get all orders (with filters)
     */
    async getAllOrders(options = {}) {
        const page = options.page || 1;
        const limit = options.limit || 20;
        const skip = (page - 1) * limit;
        const where = {};
        if (options.status)
            where.status = options.status;
        if (options.userId)
            where.userId = options.userId;
        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                include: {
                    orderItems: { include: { productVariant: true } },
                    address: true,
                    payments: true,
                    user: { select: { name: true, email: true } },
                },
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
            prisma.order.count({ where }),
        ]);
        return {
            orders,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    /**
     * Update order status (Admin only)
     */
    async updateOrderStatus(orderId, data) {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
        });
        if (!order) {
            throw new AppError("Đơn hàng không tồn tại", 404);
        }
        // Prevent certain transitions
        if (order.status === "DELIVERED" || order.status === "CANCELLED") {
            throw new AppError(`Không thể thay đổi trạng thái từ ${order.status}`, 400);
        }
        return await prisma.order.update({
            where: { id: orderId },
            data: { status: data.status },
            include: {
                orderItems: { include: { productVariant: true } },
                address: true,
            },
        });
    }
    /**
     * Cancel order and restore inventory
     */
    async cancelOrder(orderId) {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { orderItems: true },
        });
        if (!order) {
            throw new AppError("Đơn hàng không tồn tại", 404);
        }
        if (order.status === "DELIVERED" ||
            order.status === "SHIPPING" ||
            order.status === "CANCELLED") {
            throw new AppError(`Không thể hủy đơn hàng có trạng thái: ${order.status}`, 400);
        }
        //  Cancel order and restore inventory
        return await prisma.$transaction(async (tx) => {
            // Restore inventory for each item
            for (const orderItem of order.orderItems) {
                // Restore variant stock
                await tx.productVariant.update({
                    where: { id: orderItem.productVariantId },
                    data: { stock: { increment: orderItem.quantity } },
                });
                // Get variant and restore product stock
                const variant = await tx.productVariant.findUnique({
                    where: { id: orderItem.productVariantId },
                    include: { product: true },
                });
                if (variant) {
                    await tx.product.update({
                        where: { id: variant.product.id },
                        data: { stock: { increment: orderItem.quantity } },
                    });
                }
            }
            // Update order status
            // Update order status and mark payments cancelled
            await tx.payment.updateMany({
                where: { orderId },
                data: { status: "CANCELLED" },
            });
            return await tx.order.update({
                where: { id: orderId },
                data: { status: "CANCELLED" },
                include: {
                    orderItems: { include: { productVariant: true } },
                    payments: true,
                    address: true,
                },
            });
        });
    }
}
export const orderService = new OrderService();
//# sourceMappingURL=order.service.js.map