import { CreateBrandDto } from "./dto/create-brand.dto";
import { UpdateBrandDto } from "./dto/update-brand.dto";
export declare class BrandService {
    listBrands(options?: {
        includeInactive?: boolean;
    }): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        slug: string;
        description: string | null;
        logo: string | null;
    }[]>;
    createBrand(data: CreateBrandDto): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        slug: string;
        description: string | null;
        logo: string | null;
    }>;
    updateBrand(id: string, data: UpdateBrandDto): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        slug: string;
        description: string | null;
        logo: string | null;
    }>;
    deleteBrand(id: string): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        slug: string;
        description: string | null;
        logo: string | null;
    }>;
    restoreBrand(id: string): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        slug: string;
        description: string | null;
        logo: string | null;
    }>;
    hardDeleteBrand(id: string): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        slug: string;
        description: string | null;
        logo: string | null;
    }>;
}
export declare const brandService: BrandService;
//# sourceMappingURL=brand.service.d.ts.map