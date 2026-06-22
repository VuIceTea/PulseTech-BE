import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/app-error";
import { couponService } from "../coupon/coupon.service";
import { shippingService } from "../shipping/shipping.service";
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
          include: { productVariant: { include: { product: true } } },
        },
      },
    });

    if (!cart || cart.cartItems.length === 0) {
      throw new AppError("Giỏ hàng trống", 400);
    }

    // Validate stock
    for (const cartItem of cart.cartItems) {
      if (cartItem.productVariant.stock < cartItem.quantity) {
        throw new AppError("Sản phẩm đã hết hàng", 400);
      }
    }

    // 1. TÍNH TỔNG TIỀN GỐC
    let totalAmount = 0;
    const orderItems: any[] = [];

    for (const cartItem of cart.cartItems) {
      const variant = cartItem.productVariant;
      const itemTotal = Number(variant.price) * cartItem.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productVariantId: variant.id,
        quantity: cartItem.quantity,
        price: variant.price,
        totalPrice: itemTotal,
        productName: variant.product.name,
        variantInfo:
          `${variant.color || ""} ${variant.storage || ""} ${variant.ram || ""}`.trim(),
      });
    }

    // 2. ÁP DỤNG MÃ GIẢM GIÁ (NẾU CÓ)
    let discountAmount = 0;
    let finalAmount = totalAmount;

    if (data.couponCode) {
      try {
        const discountInfo = await couponService.applyCoupon(userId, {
          code: data.couponCode,
          orderAmount: totalAmount,
          productIds: cart.cartItems.map((i) => i.productVariantId),
        });
        discountAmount = discountInfo.discountAmount;
        finalAmount = discountInfo.finalAmount;
      } catch (err: any) {
        throw new AppError(err.message, 400);
      }
    }

    // 3. TÍNH PHÍ SHIP (NẾU CÓ)
    let shippingFee = 0;
    try {
      const shippingInfo = await shippingService.calculateShipping({
        addressId: data.addressId,
        orderAmount: finalAmount,
        shippingMethodId: data.shippingMethodId ?? null, // Sửa lỗi exactOptionalPropertyTypes
      });
      shippingFee = shippingInfo.shippingFee;
      finalAmount += shippingFee;
    } catch (err: any) {
      console.error("Shipping calculation error", err);
    }

    // 4. TẠO ORDER CODE VÀ PAYMENT INTENT ID
    const orderCode = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const paymentIntentId = `PI-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // 5. TẠO ORDER VÀ THANH TOÁN TRONG DATABASE
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderCode,
          userId,
          addressId: data.addressId,
          note: data.note ?? null,
          totalAmount: totalAmount.toString(),
          discountAmount: discountAmount.toString(),
          shippingFee: shippingFee.toString(),
          finalAmount: finalAmount.toString(),
          status: "PENDING",
          paymentStatus: "PENDING",
          orderItems: { createMany: { data: orderItems } },
          payments: {
            create: {
              userId: userId, // Thêm userId vào Payment
              paymentIntentId: paymentIntentId, // Thêm paymentIntentId để đối soát
              method: data.paymentMethod,
              amount: finalAmount.toString(),
              status: "PENDING",
              // Không cần cartSnapshot nữa vì Order đã được tạo trực tiếp
            },
          },
        },
        include: { orderItems: true, payments: true },
      });

      // Trừ kho
      for (const orderItem of orderItems) {
        await tx.productVariant.update({
          where: { id: orderItem.productVariantId },
          data: { stock: { decrement: orderItem.quantity } },
        });
        const variant = await tx.productVariant.findUnique({
          where: { id: orderItem.productVariantId },
        });
        if (variant) {
          await tx.product.update({
            where: { id: variant.productId },
            data: { stock: { decrement: orderItem.quantity } },
          });
        }
      }

      // Xóa giỏ hàng
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

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
   * Create an order from a cart snapshot (used by payment-intent flow)
   */
  async createOrderFromSnapshot(
    userId: string | undefined,
    addressId: string,
    items: any[],
    paymentMethod: string,
    paid: boolean,
    existingPaymentId?: string,
  ) {
    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });
    if (!address) throw new AppError("Địa chỉ không hợp lệ", 404);
    if (userId && address.userId !== userId)
      throw new AppError("Địa chỉ không thuộc user", 403);

    if (!items || items.length === 0)
      throw new AppError("Cart snapshot empty", 400);

    // Lấy thông tin Payment để có finalAmount, discountInfo, shippingInfo
    let paymentRecord: any = null;
    if (existingPaymentId) {
      paymentRecord = await prisma.payment.findUnique({
        where: { id: existingPaymentId },
      });
    }

    const snapshot = paymentRecord?.cartSnapshot as any;

    // Tính tổng tiền gốc từ snapshot
    let totalAmount = 0;
    const orderItemsData: any[] = [];

    for (const it of items) {
      const variantId = it.id || it.productVariant?.id || it.productVariantId;
      const quantity = Number(it.quantity || 1);

      const variant = await prisma.productVariant.findUnique({
        where: { id: variantId },
        include: { product: true },
      });
      if (!variant) throw new AppError("Product variant not found", 404);

      const price = Number(variant.price);
      const itemTotal = price * quantity;
      totalAmount += itemTotal;

      orderItemsData.push({
        productVariantId: variant.id,
        quantity,
        price: variant.price,
        totalPrice: itemTotal,
        productName: variant.product.name,
        variantInfo:
          `${variant.color || ""} ${variant.storage || ""} ${variant.ram || ""}`.trim(),
      });
    }

    // Lấy finalAmount từ Payment record (đã bao gồm giảm giá + phí ship)
    const finalAmount = paymentRecord
      ? Number(paymentRecord.amount)
      : totalAmount;

    // Lấy thông tin giảm giá và phí ship từ snapshot
    const discountAmount = snapshot?.discountInfo?.discountAmount || 0;
    const shippingFee = snapshot?.shippingInfo?.shippingFee || 0;
    const couponCode = snapshot?.couponCode || null;

    const orderCode = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderCode,
          userId: userId ?? address.userId ?? "",
          addressId,
          note:
            `Thanh toán qua ${paymentMethod}` +
            (couponCode ? ` - Mã giảm giá: ${couponCode}` : ""),
          totalAmount: totalAmount.toString(), // Tổng tiền gốc
          finalAmount: finalAmount.toString(), // Tiền thực trả
          discountAmount: discountAmount.toString(), // Tiền giảm giá
          shippingFee: shippingFee.toString(), // Phí ship
          status: paid ? "PROCESSING" : "FAILED",
          paymentStatus: paid ? "PAID" : "FAILED",
          orderItems: { createMany: { data: orderItemsData } },
          ...(existingPaymentId
            ? {}
            : {
                payments: {
                  create: {
                    method: paymentMethod,
                    amount: finalAmount.toString(),
                    status: paid ? "PAID" : "FAILED",
                  },
                },
              }),
        },
        include: { orderItems: true, address: true },
      });

      // Update payment cũ (quan trọng)
      if (existingPaymentId) {
        await tx.payment.update({
          where: { id: existingPaymentId },
          data: {
            status: paid ? "PAID" : "FAILED",
            paidAt: paid ? new Date() : null,
            transactionId: paid ? "VNPAY-" + Date.now() : null,
            orderId: newOrder.id,
          },
        });
      }

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

        // Clear cart
        if (userId) {
          await tx.cartItem.deleteMany({
            where: { cart: { userId } },
          });
        }
      }

      return newOrder;
    });

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
   * Admin: Update order status
   */
  async updateOrderStatus(orderId: string, data: UpdateOrderStatusDto) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });

    if (!order) {
      throw new AppError("Đơn hàng không tồn tại", 404);
    }

    if (order.status === "DELIVERED" || order.status === "RETURNED") {
      throw new AppError(
        `Không thể thay đổi trạng thái từ ${order.status}`,
        400,
      );
    }

    const newStatus = data.status;

    if (newStatus === "CANCELLED" && order.status !== "CANCELLED") {
      return await this.cancelOrder(orderId);
    }

    return await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
      include: {
        orderItems: { include: { productVariant: true } },
        address: true,
        payments: true,
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
