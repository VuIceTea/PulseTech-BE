import { z } from "zod";
export const CreateCategoryDto = z.object({
    name: z.string().min(2, "Tên category phải có ít nhất 2 ký tự").max(255),
    slug: z
        .string()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug không hợp lệ")
        .min(2)
        .max(150),
    image: z.string().url("Image phải là URL hợp lệ").optional().nullable(),
    parentId: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
});
//# sourceMappingURL=create-category.dto.js.map