import { z } from "zod";
export const UpdateBrandDto = z.object({
    name: z.string().min(2).max(255).optional(),
    slug: z
        .string()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .min(2)
        .max(150)
        .optional(),
    logo: z.string().url().optional().nullable(),
    description: z.string().max(5000).optional().nullable(),
    isActive: z.boolean().optional(),
});
//# sourceMappingURL=update-brand.dto.js.map