import { z } from "zod";

export const GetProductsQueryDto = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  isFeatured: z.coerce.boolean().optional(),
  sort: z.enum(["newest", "oldest", "price_asc", "price_desc"]).optional(),
});

export type GetProductsQueryDto = z.infer<typeof GetProductsQueryDto>;
