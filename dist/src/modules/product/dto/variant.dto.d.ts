import { z } from "zod";
export declare const CreateProductVariantDto: z.ZodObject<{
    sku: z.ZodString;
    color: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    storage: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    ram: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    price: z.ZodNumber;
    stock: z.ZodNumber;
    images: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
}, z.core.$strip>;
export type CreateProductVariantDto = z.infer<typeof CreateProductVariantDto>;
export declare const UpdateProductVariantDto: z.ZodObject<{
    sku: z.ZodOptional<z.ZodString>;
    color: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    storage: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    ram: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    price: z.ZodOptional<z.ZodNumber>;
    stock: z.ZodOptional<z.ZodNumber>;
    images: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>>;
}, z.core.$strip>;
export type UpdateProductVariantDto = z.infer<typeof UpdateProductVariantDto>;
//# sourceMappingURL=variant.dto.d.ts.map