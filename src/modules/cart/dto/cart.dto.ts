import { z } from "zod";

export const AddToCartDto = z.object({
  productVariantId: z.string().min(1, "Product variant id is required"),
  quantity: z
    .number()
    .int()
    .min(1, "Quantity must be at least 1")
    .max(999, "Quantity too high"),
});

export type AddToCartDto = z.infer<typeof AddToCartDto>;

export const UpdateCartItemDto = z.object({
  quantity: z
    .number()
    .int()
    .min(1, "Quantity must be at least 1")
    .max(999, "Quantity too high"),
});

export type UpdateCartItemDto = z.infer<typeof UpdateCartItemDto>;
