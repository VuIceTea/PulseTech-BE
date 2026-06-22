import { z } from "zod";
export declare const UpdateCategoryDto: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodString>;
    image: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    parentId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type UpdateCategoryDto = z.infer<typeof UpdateCategoryDto>;
//# sourceMappingURL=update-category.dto.d.ts.map