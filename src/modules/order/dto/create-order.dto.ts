import { z } from "zod";

export const CreateOrderDto = z.object({
  addressId: z.string().min(1, "Địa chỉ giao hàng là bắt buộc"),
  note: z.string().max(500, "Ghi chú quá dài").optional(),
  paymentMethod: z.enum(["COD", "VNPAY", "MOMO", "BANK"]).default("COD"),

  couponCode: z.string().optional(),
  shippingMethodId: z.string().optional(),
});

export type CreateOrderDto = z.infer<typeof CreateOrderDto>;

export const UpdateOrderStatusDto = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPING",
    "DELIVERED",
    "CANCELLED",
    "RETURNED",
    "FAILED",
  ]),
});

export type UpdateOrderStatusDto = z.infer<typeof UpdateOrderStatusDto>;
