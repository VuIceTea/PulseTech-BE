import { z } from "zod";
export declare const AddToCartDto: z.ZodObject<{
    productVariantId: z.ZodString;
    quantity: z.ZodNumber;
}, z.core.$strip>;
export type AddToCartDto = z.infer<typeof AddToCartDto>;
export declare const UpdateCartItemDto: z.ZodObject<{
    quantity: z.ZodNumber;
}, z.core.$strip>;
export type UpdateCartItemDto = z.infer<typeof UpdateCartItemDto>;
//# sourceMappingURL=cart.dto.d.ts.map