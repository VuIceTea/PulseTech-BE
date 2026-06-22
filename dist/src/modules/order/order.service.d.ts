import { CreateOrderDto, UpdateOrderStatusDto } from "./dto/create-order.dto";
export declare class OrderService {
    /**
     * Create order from cart with inventory deduction
     */
    createOrder(userId: string, data: CreateOrderDto): Promise<{
        orderItems: ({
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
        } & {
            id: string;
            productVariantId: string;
            quantity: number;
            price: import("@prisma/client-runtime-utils").Decimal;
            totalPrice: import("@prisma/client-runtime-utils").Decimal;
            orderId: string;
            productName: string;
            variantInfo: string;
        })[];
        address: {
            id: string;
            phone: string;
            userId: string;
            fullName: string;
            province: string;
            district: string;
            ward: string;
            detailAddress: string;
            isDefault: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        addressId: string;
        note: string | null;
        status: string;
        orderCode: string;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        shippingFee: import("@prisma/client-runtime-utils").Decimal;
        discountAmount: import("@prisma/client-runtime-utils").Decimal;
        finalAmount: import("@prisma/client-runtime-utils").Decimal;
        paymentStatus: string;
    }>;
    /**
     * Get orders by user
     */
    getUserOrders(userId: string, options?: {
        page?: number;
        limit?: number;
    }): Promise<{
        orders: ({
            payments: {
                id: string;
                createdAt: Date;
                userId: string | null;
                status: string;
                paymentIntentId: string | null;
                method: string;
                transactionId: string | null;
                amount: import("@prisma/client-runtime-utils").Decimal;
                paidAt: Date | null;
                cartSnapshot: import("@prisma/client/runtime/client").JsonValue | null;
                orderId: string | null;
            }[];
            orderItems: ({
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
            } & {
                id: string;
                productVariantId: string;
                quantity: number;
                price: import("@prisma/client-runtime-utils").Decimal;
                totalPrice: import("@prisma/client-runtime-utils").Decimal;
                orderId: string;
                productName: string;
                variantInfo: string;
            })[];
            address: {
                id: string;
                phone: string;
                userId: string;
                fullName: string;
                province: string;
                district: string;
                ward: string;
                detailAddress: string;
                isDefault: boolean;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            addressId: string;
            note: string | null;
            status: string;
            orderCode: string;
            totalAmount: import("@prisma/client-runtime-utils").Decimal;
            shippingFee: import("@prisma/client-runtime-utils").Decimal;
            discountAmount: import("@prisma/client-runtime-utils").Decimal;
            finalAmount: import("@prisma/client-runtime-utils").Decimal;
            paymentStatus: string;
        })[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    /**
     * Get single order
     */
    getOrder(orderId: string, userId?: string): Promise<{
        user: {
            name: string | null;
            email: string;
            phone: string | null;
        };
        payments: {
            id: string;
            createdAt: Date;
            userId: string | null;
            status: string;
            paymentIntentId: string | null;
            method: string;
            transactionId: string | null;
            amount: import("@prisma/client-runtime-utils").Decimal;
            paidAt: Date | null;
            cartSnapshot: import("@prisma/client/runtime/client").JsonValue | null;
            orderId: string | null;
        }[];
        orderItems: ({
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
            price: import("@prisma/client-runtime-utils").Decimal;
            totalPrice: import("@prisma/client-runtime-utils").Decimal;
            orderId: string;
            productName: string;
            variantInfo: string;
        })[];
        address: {
            id: string;
            phone: string;
            userId: string;
            fullName: string;
            province: string;
            district: string;
            ward: string;
            detailAddress: string;
            isDefault: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        addressId: string;
        note: string | null;
        status: string;
        orderCode: string;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        shippingFee: import("@prisma/client-runtime-utils").Decimal;
        discountAmount: import("@prisma/client-runtime-utils").Decimal;
        finalAmount: import("@prisma/client-runtime-utils").Decimal;
        paymentStatus: string;
    }>;
    /**
     * Create an order from a cart snapshot (used by payment-intent flow)
     * items: array of { id: productVariantId, quantity, productVariant }
     * paid: boolean - whether payment succeeded
     */
    createOrderFromSnapshot(userId: string | undefined, addressId: string, items: any[], paymentMethod: string, paid: boolean): Promise<{
        orderItems: ({
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
        } & {
            id: string;
            productVariantId: string;
            quantity: number;
            price: import("@prisma/client-runtime-utils").Decimal;
            totalPrice: import("@prisma/client-runtime-utils").Decimal;
            orderId: string;
            productName: string;
            variantInfo: string;
        })[];
        address: {
            id: string;
            phone: string;
            userId: string;
            fullName: string;
            province: string;
            district: string;
            ward: string;
            detailAddress: string;
            isDefault: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        addressId: string;
        note: string | null;
        status: string;
        orderCode: string;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        shippingFee: import("@prisma/client-runtime-utils").Decimal;
        discountAmount: import("@prisma/client-runtime-utils").Decimal;
        finalAmount: import("@prisma/client-runtime-utils").Decimal;
        paymentStatus: string;
    }>;
    /**
     * Admin: Get all orders (with filters)
     */
    getAllOrders(options?: {
        page?: number;
        limit?: number;
        status?: string;
        userId?: string;
    }): Promise<{
        orders: ({
            user: {
                name: string | null;
                email: string;
            };
            payments: {
                id: string;
                createdAt: Date;
                userId: string | null;
                status: string;
                paymentIntentId: string | null;
                method: string;
                transactionId: string | null;
                amount: import("@prisma/client-runtime-utils").Decimal;
                paidAt: Date | null;
                cartSnapshot: import("@prisma/client/runtime/client").JsonValue | null;
                orderId: string | null;
            }[];
            orderItems: ({
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
            } & {
                id: string;
                productVariantId: string;
                quantity: number;
                price: import("@prisma/client-runtime-utils").Decimal;
                totalPrice: import("@prisma/client-runtime-utils").Decimal;
                orderId: string;
                productName: string;
                variantInfo: string;
            })[];
            address: {
                id: string;
                phone: string;
                userId: string;
                fullName: string;
                province: string;
                district: string;
                ward: string;
                detailAddress: string;
                isDefault: boolean;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            addressId: string;
            note: string | null;
            status: string;
            orderCode: string;
            totalAmount: import("@prisma/client-runtime-utils").Decimal;
            shippingFee: import("@prisma/client-runtime-utils").Decimal;
            discountAmount: import("@prisma/client-runtime-utils").Decimal;
            finalAmount: import("@prisma/client-runtime-utils").Decimal;
            paymentStatus: string;
        })[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    /**
     * Update order status (Admin only)
     */
    updateOrderStatus(orderId: string, data: UpdateOrderStatusDto): Promise<{
        orderItems: ({
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
        } & {
            id: string;
            productVariantId: string;
            quantity: number;
            price: import("@prisma/client-runtime-utils").Decimal;
            totalPrice: import("@prisma/client-runtime-utils").Decimal;
            orderId: string;
            productName: string;
            variantInfo: string;
        })[];
        address: {
            id: string;
            phone: string;
            userId: string;
            fullName: string;
            province: string;
            district: string;
            ward: string;
            detailAddress: string;
            isDefault: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        addressId: string;
        note: string | null;
        status: string;
        orderCode: string;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        shippingFee: import("@prisma/client-runtime-utils").Decimal;
        discountAmount: import("@prisma/client-runtime-utils").Decimal;
        finalAmount: import("@prisma/client-runtime-utils").Decimal;
        paymentStatus: string;
    }>;
    /**
     * Cancel order and restore inventory
     */
    cancelOrder(orderId: string): Promise<{
        payments: {
            id: string;
            createdAt: Date;
            userId: string | null;
            status: string;
            paymentIntentId: string | null;
            method: string;
            transactionId: string | null;
            amount: import("@prisma/client-runtime-utils").Decimal;
            paidAt: Date | null;
            cartSnapshot: import("@prisma/client/runtime/client").JsonValue | null;
            orderId: string | null;
        }[];
        orderItems: ({
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
        } & {
            id: string;
            productVariantId: string;
            quantity: number;
            price: import("@prisma/client-runtime-utils").Decimal;
            totalPrice: import("@prisma/client-runtime-utils").Decimal;
            orderId: string;
            productName: string;
            variantInfo: string;
        })[];
        address: {
            id: string;
            phone: string;
            userId: string;
            fullName: string;
            province: string;
            district: string;
            ward: string;
            detailAddress: string;
            isDefault: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        addressId: string;
        note: string | null;
        status: string;
        orderCode: string;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
        shippingFee: import("@prisma/client-runtime-utils").Decimal;
        discountAmount: import("@prisma/client-runtime-utils").Decimal;
        finalAmount: import("@prisma/client-runtime-utils").Decimal;
        paymentStatus: string;
    }>;
}
export declare const orderService: OrderService;
//# sourceMappingURL=order.service.d.ts.map