import { z } from "zod";
export const CreateBrandDto = z.object({
    name: z.string().min(2, "Tên brand phải có ít nhất 2 ký tự").max(255),
    slug: z
        .string()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug không hợp lệ")
        .min(2)
        .max(150),
    logo: z.string().url("Logo phải là URL hợp lệ").optional().nullable(),
    description: z.string().max(5000).optional().nullable(),
    isActive: z.boolean().optional(),
});
//# sourceMappingURL=create-brand.dto.js.map