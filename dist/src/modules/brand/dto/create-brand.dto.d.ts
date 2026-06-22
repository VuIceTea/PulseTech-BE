import { z } from "zod";
export declare const CreateBrandDto: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodString;
    logo: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type CreateBrandDto = z.infer<typeof CreateBrandDto>;
//# sourceMappingURL=create-brand.dto.d.ts.map