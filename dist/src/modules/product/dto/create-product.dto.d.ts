import { z } from "zod";
export declare const CreateProductDto: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    shortDescription: z.ZodOptional<z.ZodString>;
    basePrice: z.ZodNumber;
    salePrice: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    stock: z.ZodNumber;
    brandId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    categoryId: z.ZodString;
    images: z.ZodArray<z.ZodString>;
    specifications: z.ZodNullable<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
    warrantyInfo: z.ZodOptional<z.ZodString>;
    isFeatured: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export type CreateProductDto = z.infer<typeof CreateProductDto>;
//# sourceMappingURL=create-product.dto.d.ts.map