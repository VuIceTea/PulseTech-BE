import { z } from "zod";

export const CreateProductVariantDto = z.object({
  sku: z.string().min(3, "SKU phải có ít nhất 3 ký tự").max(100, "SKU quá dài"),
  color: z.string().optional().nullable(),
  storage: z.string().optional().nullable(),
  ram: z.string().optional().nullable(),
  price: z.number().positive("Giá phải lớn hơn 0"),
  stock: z.number().int().min(0, "Số lượng không được âm"),
  images: z.array(z.string().url("Ảnh phải là URL hợp lệ")).optional().default([]),
});

export type CreateProductVariantDto = z.infer<typeof CreateProductVariantDto>;

export const UpdateProductVariantDto = CreateProductVariantDto.partial();

export type UpdateProductVariantDto = z.infer<typeof UpdateProductVariantDto>;
