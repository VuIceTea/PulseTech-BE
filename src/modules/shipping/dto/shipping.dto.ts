import { z } from "zod";

export const CalculateShippingDto = z.object({
  addressId: z.string().min(1, "Địa chỉ giao hàng là bắt buộc"),
  orderAmount: z.number().positive("Số tiền đơn hàng phải lớn hơn 0"),
  shippingMethodId: z.string().nullish(),
});

export type CalculateShippingDto = z.infer<typeof CalculateShippingDto>;
