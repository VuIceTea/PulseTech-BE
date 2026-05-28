import { z } from "zod";

export const CreateProductDto = z
  .object({
    name: z
      .string()
      .min(3, "Tên sản phẩm phải có ít nhất 3 ký tự")
      .max(255, "Tên sản phẩm tối đa 255 ký tự"),

    slug: z
      .string()
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug chỉ được chứa chữ thường, số và dấu gạch ngang",
      )
      .min(3, "Slug phải có ít nhất 3 ký tự")
      .max(150, "Slug quá dài"),

    description: z.string().max(5000, "Mô tả quá dài").optional(),
    shortDescription: z.string().max(255, "Mô tả ngắn quá dài").optional(),

    basePrice: z.number().positive("Giá gốc phải lớn hơn 0"),
    salePrice: z
      .number()
      .positive("Giá khuyến mãi phải lớn hơn 0")
      .optional()
      .nullable(),

    stock: z
      .number()
      .int()
      .min(0, "Số lượng không được âm")
      .max(99999, "Số lượng quá lớn"),

    brandId: z.string().optional().nullable(),
    categoryId: z.string().min(1, "Vui lòng chọn danh mục"), // ← Sửa ở đây

    images: z
      .array(z.string().url("Ảnh phải là URL hợp lệ"))
      .min(1, "Phải có ít nhất 1 ảnh sản phẩm")
      .max(10, "Tối đa 10 ảnh cho một sản phẩm"),

    specifications: z.record(z.string(), z.any()).optional().nullable(),
    warrantyInfo: z.string().max(500, "Thông tin bảo hành quá dài").optional(),

    isFeatured: z.boolean().default(false),
  })
  .refine((data) => !data.salePrice || data.salePrice < data.basePrice, {
    message: "Giá khuyến mãi phải nhỏ hơn giá gốc",
    path: ["salePrice"],
  });

export type CreateProductDto = z.infer<typeof CreateProductDto>;
