import { z } from "zod";
export const UpdateProductDto = z.object({
    name: z.string().min(3).max(255).optional(),
    slug: z
        .string()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .optional(),
    description: z.string().max(5000).optional(),
    shortDescription: z.string().max(255).optional(),
    basePrice: z.number().positive().optional(),
    salePrice: z.number().positive().optional().nullable(),
    stock: z.number().int().min(0).optional(),
    images: z.array(z.string().url()).min(1).optional(),
    brandId: z.string().optional().nullable(),
    categoryId: z.string().optional(),
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    warrantyInfo: z.string().max(500).optional(),
    specifications: z.record(z.string(), z.any()).optional().nullable(),
});
//# sourceMappingURL=update-product.dto.js.map