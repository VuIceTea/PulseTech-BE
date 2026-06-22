import { z } from "zod";

export const CreatePromotionDto = z.object({
  name: z.string().min(3).max(200),
  description: z.string().max(500).optional(),
  discountValue: z.number().positive(),
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  productVariantId: z.string().min(1),
  isActive: z.boolean().default(true),
});

export const UpdatePromotionDto = CreatePromotionDto.partial();

export type CreatePromotionDto = z.infer<typeof CreatePromotionDto>;
export type UpdatePromotionDto = z.infer<typeof UpdatePromotionDto>;
