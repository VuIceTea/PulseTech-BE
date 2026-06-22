import { z } from "zod";

export const CreateCouponDto = z.object({
  code: z.string().min(3, "Mã giảm giá phải có ít nhất 3 ký tự").max(50),
  discountValue: z.number().positive("Giá trị giảm giá phải lớn hơn 0"),
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
  description: z.string().max(500).optional(),
  minOrderAmount: z.number().positive().optional().nullable(),
  maxDiscount: z.number().positive().optional().nullable(),
  validFrom: z.string().datetime(),
  validTo: z.string().datetime(),
  usageLimit: z.number().int().min(1).optional().nullable(),
  isActive: z.boolean().default(true),
  isPublic: z.boolean().default(true),
  applicableProductIds: z.array(z.string()).optional().nullable(),
});

export const ApplyCouponDto = z.object({
  code: z.string().min(3),
  orderAmount: z.number().positive(),
  productIds: z.array(z.string()).optional(),
});

export const UpdateCouponDto = CreateCouponDto.partial();

export type CreateCouponDto = z.infer<typeof CreateCouponDto>;
export type ApplyCouponDto = z.infer<typeof ApplyCouponDto>;
export type UpdateCouponDto = z.infer<typeof UpdateCouponDto>;
