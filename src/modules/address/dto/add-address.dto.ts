import { z } from "zod";

export const AddAddressDto = z.object({
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  phone: z.string().regex(/^[0-9]{10}$/, "Số điện thoại phải có 10 chữ số"),
  province: z.string().min(1, "Tỉnh/Thành phố không được để trống"),
  district: z.string().min(1, "Quận/Huyện không được để trống"),
  ward: z.string().min(1, "Phường/Xã không được để trống"),
  detailAddress: z.string().min(5, "Địa chỉ chi tiết phải có ít nhất 5 ký tự"),
  isDefault: z.boolean().default(false),
});

export type AddAddressDto = z.infer<typeof AddAddressDto>;
