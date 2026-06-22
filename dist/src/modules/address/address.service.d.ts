import { AddAddressDto } from "./dto/add-address.dto";
export declare function addAddress(userId: string, data: AddAddressDto): Promise<{
    id: string;
    phone: string;
    fullName: string;
    province: string;
    district: string;
    ward: string;
    detailAddress: string;
    isDefault: boolean;
}>;
export declare function listAddresses(userId: string): Promise<{
    id: string;
    phone: string;
    userId: string;
    fullName: string;
    province: string;
    district: string;
    ward: string;
    detailAddress: string;
    isDefault: boolean;
}[]>;
export declare function updateAddress(userId: string, addressId: string, data: AddAddressDto): Promise<{
    id: string;
    phone: string;
    fullName: string;
    province: string;
    district: string;
    ward: string;
    detailAddress: string;
    isDefault: boolean;
}>;
export declare function deleteAddress(userId: string, addressId: string): Promise<void>;
//# sourceMappingURL=address.service.d.ts.map