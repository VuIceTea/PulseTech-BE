import { z } from "zod";
export declare const AddAddressDto: z.ZodObject<{
    fullName: z.ZodString;
    phone: z.ZodString;
    province: z.ZodString;
    district: z.ZodString;
    ward: z.ZodString;
    detailAddress: z.ZodString;
    isDefault: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export type AddAddressDto = z.infer<typeof AddAddressDto>;
//# sourceMappingURL=add-address.dto.d.ts.map