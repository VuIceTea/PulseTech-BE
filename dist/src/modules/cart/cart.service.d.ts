import { AddToCartDto, UpdateCartItemDto } from "./dto/cart.dto";
export declare class CartService {
    /**
     * Get or create user's cart
     */
    private getOrCreateCart;
    /**
     * Get cart with items
     */
    getCart(userId: string): Promise<{
        id: string;
        userId: string;
        cartItems: {
            cartItemId: string;
            productVariantId: string;
            productVariant: {
                product: {
                    name: string;
                    id: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    stock: number;
                    images: string[];
                    slug: string;
                    description: string | null;
                    shortDescription: string | null;
                    basePrice: import("@prisma/client-runtime-utils").Decimal;
                    salePrice: import("@prisma/client-runtime-utils").Decimal | null;
                    specifications: import("@prisma/client/runtime/client").JsonValue | null;
                    warrantyInfo: string | null;
                    isFeatured: boolean;
                    brandId: string | null;
                    categoryId: string;
                };
            } & {
                id: string;
                productId: string;
                sku: string;
                color: string | null;
                storage: string | null;
                ram: string | null;
                price: import("@prisma/client-runtime-utils").Decimal;
                stock: number;
                images: string[];
            };
            quantity: number;
            itemTotal: number;
        }[];
        totalPrice: number;
    } | null>;
    /**
     * Get guest cart from redis
     *
     */
    getGuestCart(cartId: string): Promise<{
        cartItems: ({
            id: string;
            productVariant: {
                product: {
                    name: string;
                    id: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    stock: number;
                    images: string[];
                    slug: string;
                    description: string | null;
                    shortDescription: string | null;
                    basePrice: import("@prisma/client-runtime-utils").Decimal;
                    salePrice: import("@prisma/client-runtime-utils").Decimal | null;
                    specifications: import("@prisma/client/runtime/client").JsonValue | null;
                    warrantyInfo: string | null;
                    isFeatured: boolean;
                    brandId: string | null;
                    categoryId: string;
                };
            } & {
                id: string;
                productId: string;
                sku: string;
                color: string | null;
                storage: string | null;
                ram: string | null;
                price: import("@prisma/client-runtime-utils").Decimal;
                stock: number;
                images: string[];
            };
            quantity: number;
            itemTotal: number;
        } | null)[];
        totalPrice: number;
    }>;
    /**
     * Add item to cart
     */
    addToCart(userId: string, data: AddToCartDto): Promise<{
        productVariant: {
            product: {
                name: string;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                stock: number;
                images: string[];
                slug: string;
                description: string | null;
                shortDescription: string | null;
                basePrice: import("@prisma/client-runtime-utils").Decimal;
                salePrice: import("@prisma/client-runtime-utils").Decimal | null;
                specifications: import("@prisma/client/runtime/client").JsonValue | null;
                warrantyInfo: string | null;
                isFeatured: boolean;
                brandId: string | null;
                categoryId: string;
            };
        } & {
            id: string;
            productId: string;
            sku: string;
            color: string | null;
            storage: string | null;
            ram: string | null;
            price: import("@prisma/client-runtime-utils").Decimal;
            stock: number;
            images: string[];
        };
    } & {
        id: string;
        productVariantId: string;
        quantity: number;
        cartId: string;
    }>;
    /**
     * Add item to guest cart in redis
     */
    addToGuestCart(cartId: string, data: AddToCartDto): Promise<{
        cartItemId: undefined;
        productVariantId: string;
        productVariant: {
            product: {
                name: string;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                stock: number;
                images: string[];
                slug: string;
                description: string | null;
                shortDescription: string | null;
                basePrice: import("@prisma/client-runtime-utils").Decimal;
                salePrice: import("@prisma/client-runtime-utils").Decimal | null;
                specifications: import("@prisma/client/runtime/client").JsonValue | null;
                warrantyInfo: string | null;
                isFeatured: boolean;
                brandId: string | null;
                categoryId: string;
            };
        } & {
            id: string;
            productId: string;
            sku: string;
            color: string | null;
            storage: string | null;
            ram: string | null;
            price: import("@prisma/client-runtime-utils").Decimal;
            stock: number;
            images: string[];
        };
        quantity: number | undefined;
    }>;
    /**
     * Update cart item quantity
     */
    updateCartItem(userId: string, cartItemId: string, data: UpdateCartItemDto): Promise<{
        cartItemId: string;
        productVariantId: string;
        productVariant: {
            product: {
                name: string;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                stock: number;
                images: string[];
                slug: string;
                description: string | null;
                shortDescription: string | null;
                basePrice: import("@prisma/client-runtime-utils").Decimal;
                salePrice: import("@prisma/client-runtime-utils").Decimal | null;
                specifications: import("@prisma/client/runtime/client").JsonValue | null;
                warrantyInfo: string | null;
                isFeatured: boolean;
                brandId: string | null;
                categoryId: string;
            };
        } & {
            id: string;
            productId: string;
            sku: string;
            color: string | null;
            storage: string | null;
            ram: string | null;
            price: import("@prisma/client-runtime-utils").Decimal;
            stock: number;
            images: string[];
        };
        quantity: number;
    }>;
    /**
     * Update guest cart item quantity
     */
    updateGuestCartItem(cartId: string, productVariantId: string, data: UpdateCartItemDto): Promise<{
        cartItemId: undefined;
        productVariantId: string;
        productVariant: {
            id: string;
            productId: string;
            sku: string;
            color: string | null;
            storage: string | null;
            ram: string | null;
            price: import("@prisma/client-runtime-utils").Decimal;
            stock: number;
            images: string[];
        };
        quantity: number;
    }>;
    /**
     * Remove item from cart
     */
    removeFromCart(userId: string, cartItemId: string): Promise<{
        id: string;
        productVariantId: string;
        quantity: number;
        cartId: string;
    }>;
    /**
     * Remove item from guest cart
     */
    removeFromGuestCart(cartId: string, productVariantId: string): Promise<{
        message: string;
    }>;
    /**
     * Clear all cart items
     */
    clearCart(userId: string): Promise<import("../../../generated/prisma/internal/prismaNamespace").BatchPayload>;
    /**
     * Clear guest cart
     */
    clearGuestCart(cartId: string): Promise<{
        message: string;
    }>;
    /**
     * Merge guest cart into user's DB cart. After merging, guest cart is cleared.
     */
    mergeGuestCartToUser(userId: string, cartId: string): Promise<void>;
}
export declare const cartService: CartService;
//# sourceMappingURL=cart.service.d.ts.map