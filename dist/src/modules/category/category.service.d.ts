import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
export declare class CategoryService {
    listCategories(options?: {
        includeInactive?: boolean;
    }): Promise<({
        parent: {
            name: string;
            id: string;
            slug: string;
        } | null;
    } & {
        level: number;
        name: string;
        id: string;
        isActive: boolean;
        slug: string;
        image: string | null;
        parentId: string | null;
    })[]>;
    createCategory(data: CreateCategoryDto): Promise<{
        level: number;
        name: string;
        id: string;
        isActive: boolean;
        slug: string;
        image: string | null;
        parentId: string | null;
    }>;
    updateCategory(id: string, data: UpdateCategoryDto): Promise<{
        level: number;
        name: string;
        id: string;
        isActive: boolean;
        slug: string;
        image: string | null;
        parentId: string | null;
    }>;
    deleteCategory(id: string): Promise<{
        level: number;
        name: string;
        id: string;
        isActive: boolean;
        slug: string;
        image: string | null;
        parentId: string | null;
    }>;
    restoreCategory(id: string): Promise<{
        level: number;
        name: string;
        id: string;
        isActive: boolean;
        slug: string;
        image: string | null;
        parentId: string | null;
    }>;
    hardDeleteCategory(id: string): Promise<{
        level: number;
        name: string;
        id: string;
        isActive: boolean;
        slug: string;
        image: string | null;
        parentId: string | null;
    }>;
}
export declare const categoryService: CategoryService;
//# sourceMappingURL=category.service.d.ts.map