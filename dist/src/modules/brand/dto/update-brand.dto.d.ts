import { z } from "zod";
export declare const UpdateBrandDto: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodString>;
    logo: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type UpdateBrandDto = z.infer<typeof UpdateBrandDto>;
//# sourceMappingURL=update-brand.dto.d.ts.map