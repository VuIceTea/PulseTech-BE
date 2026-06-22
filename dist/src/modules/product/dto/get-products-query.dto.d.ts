import { z } from "zod";
export declare const GetProductsQueryDto: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    search: z.ZodOptional<z.ZodString>;
    categoryId: z.ZodOptional<z.ZodString>;
    brandId: z.ZodOptional<z.ZodString>;
    minPrice: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    maxPrice: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    isFeatured: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
    sort: z.ZodOptional<z.ZodEnum<{
        newest: "newest";
        price_asc: "price_asc";
        price_desc: "price_desc";
        oldest: "oldest";
    }>>;
}, z.core.$strip>;
export type GetProductsQueryDto = z.infer<typeof GetProductsQueryDto>;
export declare const GetAdminProductsQueryDto: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    search: z.ZodOptional<z.ZodString>;
    categoryId: z.ZodOptional<z.ZodString>;
    brandId: z.ZodOptional<z.ZodString>;
    minPrice: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    maxPrice: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    isFeatured: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
    sort: z.ZodOptional<z.ZodEnum<{
        newest: "newest";
        price_asc: "price_asc";
        price_desc: "price_desc";
        oldest: "oldest";
    }>>;
    isActive: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
}, z.core.$strip>;
export type GetAdminProductsQueryDto = z.infer<typeof GetAdminProductsQueryDto>;
//# sourceMappingURL=get-products-query.dto.d.ts.map