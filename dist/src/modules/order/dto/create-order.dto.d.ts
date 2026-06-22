import { z } from "zod";
export declare const CreateOrderDto: z.ZodObject<{
    addressId: z.ZodString;
    note: z.ZodOptional<z.ZodString>;
    paymentMethod: z.ZodDefault<z.ZodEnum<{
        COD: "COD";
        VNPAY: "VNPAY";
        MOMO: "MOMO";
        BANK: "BANK";
    }>>;
}, z.core.$strip>;
export type CreateOrderDto = z.infer<typeof CreateOrderDto>;
export declare const UpdateOrderStatusDto: z.ZodObject<{
    status: z.ZodEnum<{
        PENDING: "PENDING";
        CONFIRMED: "CONFIRMED";
        PROCESSING: "PROCESSING";
        SHIPPING: "SHIPPING";
        DELIVERED: "DELIVERED";
        CANCELLED: "CANCELLED";
        RETURNED: "RETURNED";
    }>;
}, z.core.$strip>;
export type UpdateOrderStatusDto = z.infer<typeof UpdateOrderStatusDto>;
//# sourceMappingURL=create-order.dto.d.ts.map