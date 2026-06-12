import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/app-error";
import { CreateOrderDto, UpdateOrderStatusDto } from "./dto/create-order.dto";

export class OrderService {
  /**
   * Create order from cart with inventory deduction
   */
  async createOrder(userId: string, data: CreateOrderDto) {
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
        throw new AppError(
          `Không đủ hàng cho sản phẩm: ${variant.product.name}. Còn lại: ${variant.stock}`,
          400,
        );
      }
    }

    // Calculate totals
    let totalAmount = 0;
    const orderItems: any[] = [];

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
        variantInfo:
          `${variant.color || ""}${variant.storage ? " " + variant.storage : ""}${variant.ram ? " " + variant.ram : ""}`.trim(),
      });
    }

    // Generate order code
    const orderCode = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Start transaction: Create order and deduct inventory
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
  async getUserOrders(
    userId: string,
    options: { page?: number; limit?: number } = {},
  ) {
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
  async getOrder(orderId: string, userId?: string) {
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
   * Admin: Get all orders (with filters)
   */
  async getAllOrders(
    options: {
      page?: number;
      limit?: number;
      status?: string;
      userId?: string;
    } = {},
  ) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.userId) where.userId = options.userId;

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
  async updateOrderStatus(orderId: string, data: UpdateOrderStatusDto) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new AppError("Đơn hàng không tồn tại", 404);
    }

    // Prevent certain transitions
    if (order.status === "DELIVERED" || order.status === "CANCELLED") {
      throw new AppError(
        `Không thể thay đổi trạng thái từ ${order.status}`,
        400,
      );
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
  async cancelOrder(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });

    if (!order) {
      throw new AppError("Đơn hàng không tồn tại", 404);
    }

    if (
      order.status === "DELIVERED" ||
      order.status === "SHIPPING" ||
      order.status === "CANCELLED"
    ) {
      throw new AppError(
        `Không thể hủy đơn hàng có trạng thái: ${order.status}`,
        400,
      );
    }

    // Start transaction: Cancel order and restore inventory
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
      return await tx.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" },
      });
    });
  }
}

export const orderService = new OrderService();
