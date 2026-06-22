import { z } from "zod";
export const UpdateCategoryDto = z.object({
    name: z.string().min(2).max(255).optional(),
    slug: z
        .string()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .min(2)
        .max(150)
        .optional(),
    image: z.string().url().optional().nullable(),
    parentId: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
});
//# sourceMappingURL=update-category.dto.js.map