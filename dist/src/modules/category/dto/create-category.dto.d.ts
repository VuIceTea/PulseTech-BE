import { z } from "zod";
export declare const CreateCategoryDto: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodString;
    image: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    parentId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type CreateCategoryDto = z.infer<typeof CreateCategoryDto>;
//# sourceMappingURL=create-category.dto.d.ts.map