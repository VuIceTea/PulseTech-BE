import { z } from "zod";
export declare const UpdateProductDto: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    shortDescription: z.ZodOptional<z.ZodString>;
    basePrice: z.ZodOptional<z.ZodNumber>;
    salePrice: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    stock: z.ZodOptional<z.ZodNumber>;
    images: z.ZodOptional<z.ZodArray<z.ZodString>>;
    brandId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    categoryId: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    isFeatured: z.ZodOptional<z.ZodBoolean>;
    warrantyInfo: z.ZodOptional<z.ZodString>;
    specifications: z.ZodNullable<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
}, z.core.$strip>;
export type UpdateProductDto = z.infer<typeof UpdateProductDto>;
//# sourceMappingURL=update-product.dto.d.ts.map