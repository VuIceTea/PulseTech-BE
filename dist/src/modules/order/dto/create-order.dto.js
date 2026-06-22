import { z } from "zod";
export const CreateOrderDto = z.object({
    addressId: z.string().min(1, "Địa chỉ giao hàng là bắt buộc"),
    note: z.string().max(500, "Ghi chú quá dài").optional(),
    paymentMethod: z.enum(["COD", "VNPAY", "MOMO", "BANK"]).default("COD"),
});
export const UpdateOrderStatusDto = z.object({
    status: z.enum([
        "PENDING",
        "CONFIRMED",
        "PROCESSING",
        "SHIPPING",
        "DELIVERED",
        "CANCELLED",
        "RETURNED",
    ]),
});
//# sourceMappingURL=create-order.dto.js.map