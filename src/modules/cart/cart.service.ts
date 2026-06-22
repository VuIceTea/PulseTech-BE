import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/app-error";
import { AddToCartDto, UpdateCartItemDto } from "./dto/cart.dto";
import redisClient from "../../lib/redis";

type GuestCartItem = {
  productVariantId: string;
  quantity: number;
};

export class CartService {
  /**
   * Get or create user's cart
   */
  private async getOrCreateCart(userId: string) {
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
  // async getCart(userId: string) {
  //   console.log(`🔍 Getting cart for user: ${userId}`);

  //   // Đảm bảo Cart record tồn tại
  //   let cart = await prisma.cart.findUnique({
  //     where: { userId },
  //   });

  //   if (!cart) {
  //     cart = await prisma.cart.create({
  //       data: { userId },
  //     });
  //     console.log(`✅ Created new cart for user ${userId}`);
  //   }

  //   // Query đầy đủ Cart + CartItems
  //   const fullCart = await prisma.cart.findUnique({
  //     where: { id: cart.id },
  //     include: {
  //       cartItems: {
  //         include: {
  //           productVariant: {
  //             include: {
  //               product: true,
  //             },
  //           },
  //         },
  //       },
  //     },
  //   });

  //   if (!fullCart) {
  //     console.log("❌ Cart not found after query");
  //     return { id: cart.id, userId, cartItems: [], totalPrice: 0 };
  //   }

  //   let totalPrice = 0;
  //   const items = fullCart.cartItems.map((item) => {
  //     const price = Number(item.productVariant.price);
  //     const itemTotal = price * item.quantity;
  //     totalPrice += itemTotal;

  //     return {
  //       cartItemId: item.id,
  //       productVariantId: item.productVariant.id,
  //       productVariant: item.productVariant,
  //       quantity: item.quantity,
  //       itemTotal,
  //     };
  //   });

  //   console.log(
  //     `✅ Loaded cart successfully: ${items.length} items, total = ${totalPrice}`,
  //   );

  //   return {
  //     id: fullCart.id,
  //     userId: fullCart.userId,
  //     cartItems: items,
  //     totalPrice,
  //   };
  // }

  async getCart(userId: string) {
    console.log(`[GetCart] === BẮT ĐẦU LẤY GIỎ HÀNG CHO USER: ${userId} ===`);

    // Bước 1: Tìm hoặc tạo Cart record
    let cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
      });
      console.log(`[GetCart] Đã tạo cart mới cho user ${userId}`);
    }

    console.log(`[GetCart] Cart ID: ${cart.id}`);

    // Bước 2: Query đầy đủ cartItems
    const fullCart = await prisma.cart.findUnique({
      where: { id: cart.id },
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

    console.log(
      `[GetCart] Số cartItems tìm thấy: ${fullCart?.cartItems?.length || 0}`,
    );

    if (!fullCart || fullCart.cartItems.length === 0) {
      console.log(`[GetCart] ❌ Giỏ hàng trống hoặc không tìm thấy cartItems`);
      return {
        id: cart.id,
        userId,
        cartItems: [],
        totalPrice: 0,
      };
    }

    // Tính toán
    let totalPrice = 0;
    const items = fullCart.cartItems.map((item) => {
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

    console.log(
      `[GetCart] ✅ THÀNH CÔNG: ${items.length} sản phẩm, tổng tiền = ${totalPrice}`,
    );

    return {
      id: fullCart.id,
      userId: fullCart.userId,
      cartItems: items,
      totalPrice,
    };
  }

  /**
   * Get guest cart from redis
   *
   */
  async getGuestCart(cartId: string) {
    if (!cartId) return { cartItems: [], totalPrice: 0 };
    const key = `cart:${cartId}`;
    const raw = await redisClient.get(key);
    const items: GuestCartItem[] = raw ? JSON.parse(raw) : [];

    // Get variant and product details for each item
    let totalPrice = 0;
    const detailed = await Promise.all(
      items.map(async (it) => {
        const variant = await prisma.productVariant.findUnique({
          where: { id: it.productVariantId },
          include: { product: true },
        });
        if (!variant) return null;
        const price = Number(variant.price);
        const itemTotal = price * it.quantity;
        totalPrice += itemTotal;
        return {
          id: it.productVariantId,
          productVariant: variant,
          quantity: it.quantity,
          itemTotal,
        };
      }),
    );

    return {
      cartItems: detailed.filter(Boolean),
      totalPrice,
    };
  }

  /**
   * Add item to cart
   */
  async addToCart(userId: string, data: AddToCartDto) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: data.productVariantId },
      include: { product: true },
    });

    if (!variant) throw new AppError("Product variant not found", 404);
    if (variant.stock <= 0) throw new AppError("Product out of stock", 400);

    const cart = await this.getOrCreateCart(userId);

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productVariantId: data.productVariantId,
      },
    });

    const newQuantity = existingItem
      ? existingItem.quantity + data.quantity
      : data.quantity;

    // Chỉ kiểm tra stock nếu vượt quá
    if (newQuantity > variant.stock) {
      throw new AppError(`Only ${variant.stock} items available in stock`, 400);
    }

    if (existingItem) {
      const updated = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: { productVariant: { include: { product: true } } },
      });
      console.log(`✅ Updated existing cart item quantity to ${newQuantity}`);
      return updated;
    } else {
      const created = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productVariantId: data.productVariantId,
          quantity: newQuantity,
        },
        include: { productVariant: { include: { product: true } } },
      });
      console.log(`✅ Added new item to cart`);
      return created;
    }
  }

  /**
   * Add item to guest cart in redis
   */
  async addToGuestCart(cartId: string, data: AddToCartDto) {
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
    const items: GuestCartItem[] = raw ? JSON.parse(raw) : [];

    const idx = items.findIndex(
      (i) => i.productVariantId === data.productVariantId,
    );

    if (idx >= 0) {
      const newQuantity = items[idx]!.quantity + data.quantity;
      if (newQuantity > variant.stock) {
        throw new AppError(
          `Cannot add more. Max available: ${variant.stock}`,
          400,
        );
      }
      items[idx]!.quantity = newQuantity;
    } else {
      if (data.quantity > variant.stock) {
        throw new AppError(
          `Only ${variant.stock} items available in stock`,
          400,
        );
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
  async updateCartItem(
    userId: string,
    cartItemId: string,
    data: UpdateCartItemDto,
  ) {
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
      throw new AppError(
        `Only ${cartItem.productVariant.stock} items available in stock`,
        400,
      );
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
  async updateGuestCartItem(
    cartId: string,
    productVariantId: string,
    data: UpdateCartItemDto,
  ) {
    if (!cartId) throw new AppError("Cart id is required", 400);
    const key = `cart:${cartId}`;
    const raw = await redisClient.get(key);
    const items: GuestCartItem[] = raw ? JSON.parse(raw) : [];

    const idx = items.findIndex((i) => i.productVariantId === productVariantId);
    if (idx < 0) throw new AppError("Cart item not found", 404);

    const variant = await prisma.productVariant.findUnique({
      where: { id: productVariantId },
    });
    if (!variant) throw new AppError("Product variant not found", 404);
    if (variant.stock < data.quantity) {
      throw new AppError(`Only ${variant.stock} items available in stock`, 400);
    }

    items[idx]!.quantity = data.quantity;
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
  async removeFromCart(userId: string, cartItemId: string) {
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
  async removeFromGuestCart(cartId: string, productVariantId: string) {
    if (!cartId) throw new AppError("Cart id is required", 400);
    const key = `cart:${cartId}`;
    const raw = await redisClient.get(key);
    const items: GuestCartItem[] = raw ? JSON.parse(raw) : [];
    const newItems = items.filter(
      (i) => i.productVariantId !== productVariantId,
    );
    await redisClient.set(key, JSON.stringify(newItems));
    return { message: "Removed" };
  }

  /**
   * Clear all cart items
   */
  async clearCart(userId: string) {
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
  async clearGuestCart(cartId: string) {
    if (!cartId) throw new AppError("Cart id is required", 400);
    const key = `cart:${cartId}`;
    await redisClient.del(key);
    return { message: "Cleared" };
  }

  /**
   * Merge guest cart into user's DB cart. After merging, guest cart is cleared.
   */
  // async mergeGuestCartToUser(userId: string, cartId: string) {
  //   if (!cartId) return;

  //   const key = `cart:${cartId}`;
  //   const raw = await redisClient.get(key);
  //   if (!raw) return;

  //   const items: GuestCartItem[] = JSON.parse(raw);
  //   console.log(`🔄 Merging ${items.length} guest items to user ${userId}`);

  //   for (const it of items) {
  //     try {
  //       await this.addToCart(userId, {
  //         productVariantId: it.productVariantId,
  //         quantity: it.quantity,
  //       });
  //     } catch (err: any) {
  //       console.error(
  //         `⚠️ Failed to merge item ${it.productVariantId}: ${err.message}`,
  //       );
  //       // Vẫn tiếp tục merge các item khác
  //     }
  //   }

  //   await redisClient.del(key);
  //   console.log("✅ Guest cart cleared after merge");
  // }
  async mergeGuestCartToUser(userId: string, cartId: string) {
    if (!cartId) return;

    const key = `cart:${cartId}`;
    const raw = await redisClient.get(key);

    if (!raw) {
      console.log(`[Merge] Không tìm thấy giỏ hàng guest: ${key}`);
      return;
    }

    const items: GuestCartItem[] = JSON.parse(raw);
    console.log(
      `[Merge] Đang merge ${items.length} sản phẩm từ guest cart ${cartId} vào user ${userId}`,
    );

    for (const item of items) {
      try {
        await this.addToCart(userId, {
          productVariantId: item.productVariantId,
          quantity: item.quantity,
        });
        console.log(
          `[Merge] ✓ Đã merge variant ${item.productVariantId} (qty: ${item.quantity})`,
        );
      } catch (err: any) {
        console.error(
          `[Merge] ✗ Lỗi merge variant ${item.productVariantId}:`,
          err.message,
        );
      }
    }

    // Xóa giỏ hàng guest sau khi merge
    await redisClient.del(key);
    console.log(`[Merge] ✓ Đã xóa giỏ hàng guest ${key}`);
  }
}

export const cartService = new CartService();
