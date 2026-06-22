import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
export declare class ProductService {
    private buildProductListQuery;
    /**
     * Get a list of products (with pagination, filtering, and search)
     */
    getProducts(query?: any): Promise<{
        products: ({
            brand: {
                name: string;
                id: string;
                isActive: boolean;
                slug: string;
                description: string | null;
                logo: string | null;
            } | null;
            category: {
                level: number;
                name: string;
                id: string;
                isActive: boolean;
                slug: string;
                image: string | null;
                parentId: string | null;
            };
            productVariants: {
                id: string;
                productId: string;
                sku: string;
                color: string | null;
                storage: string | null;
                ram: string | null;
                price: import("@prisma/client-runtime-utils").Decimal;
                stock: number;
                images: string[];
            }[];
        } & {
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            stock: number;
            images: string[];
            slug: string;
            description: string | null;
            shortDescription: string | null;
            basePrice: import("@prisma/client-runtime-utils").Decimal;
            salePrice: import("@prisma/client-runtime-utils").Decimal | null;
            specifications: import("@prisma/client/runtime/client").JsonValue | null;
            warrantyInfo: string | null;
            isFeatured: boolean;
            brandId: string | null;
            categoryId: string;
        })[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    /**
     * Get a list of products (Admin, including inactive)
     */
    getAdminProducts(query?: any): Promise<{
        products: ({
            brand: {
                name: string;
                id: string;
                isActive: boolean;
                slug: string;
                description: string | null;
                logo: string | null;
            } | null;
            category: {
                level: number;
                name: string;
                id: string;
                isActive: boolean;
                slug: string;
                image: string | null;
                parentId: string | null;
            };
            productVariants: {
                id: string;
                productId: string;
                sku: string;
                color: string | null;
                storage: string | null;
                ram: string | null;
                price: import("@prisma/client-runtime-utils").Decimal;
                stock: number;
                images: string[];
            }[];
        } & {
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            stock: number;
            images: string[];
            slug: string;
            description: string | null;
            shortDescription: string | null;
            basePrice: import("@prisma/client-runtime-utils").Decimal;
            salePrice: import("@prisma/client-runtime-utils").Decimal | null;
            specifications: import("@prisma/client/runtime/client").JsonValue | null;
            warrantyInfo: string | null;
            isFeatured: boolean;
            brandId: string | null;
            categoryId: string;
        })[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    /**
     * get all product by slug
     */
    getProductBySlug(slug: string): Promise<{
        reviews: ({
            user: {
                name: string | null;
                avatar: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            productId: string;
            images: string[];
            rating: number;
            comment: string | null;
            isApproved: boolean;
        })[];
        brand: {
            name: string;
            id: string;
            isActive: boolean;
            slug: string;
            description: string | null;
            logo: string | null;
        } | null;
        category: {
            level: number;
            name: string;
            id: string;
            isActive: boolean;
            slug: string;
            image: string | null;
            parentId: string | null;
        };
        productVariants: {
            id: string;
            productId: string;
            sku: string;
            color: string | null;
            storage: string | null;
            ram: string | null;
            price: import("@prisma/client-runtime-utils").Decimal;
            stock: number;
            images: string[];
        }[];
    } & {
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        stock: number;
        images: string[];
        slug: string;
        description: string | null;
        shortDescription: string | null;
        basePrice: import("@prisma/client-runtime-utils").Decimal;
        salePrice: import("@prisma/client-runtime-utils").Decimal | null;
        specifications: import("@prisma/client/runtime/client").JsonValue | null;
        warrantyInfo: string | null;
        isFeatured: boolean;
        brandId: string | null;
        categoryId: string;
    }>;
    /**
     * Select the featured product.
     */
    getFeaturedProducts(limit?: number): Promise<({
        brand: {
            name: string;
            id: string;
            isActive: boolean;
            slug: string;
            description: string | null;
            logo: string | null;
        } | null;
        category: {
            level: number;
            name: string;
            id: string;
            isActive: boolean;
            slug: string;
            image: string | null;
            parentId: string | null;
        };
    } & {
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        stock: number;
        images: string[];
        slug: string;
        description: string | null;
        shortDescription: string | null;
        basePrice: import("@prisma/client-runtime-utils").Decimal;
        salePrice: import("@prisma/client-runtime-utils").Decimal | null;
        specifications: import("@prisma/client/runtime/client").JsonValue | null;
        warrantyInfo: string | null;
        isFeatured: boolean;
        brandId: string | null;
        categoryId: string;
    })[]>;
    /**
     * Create new product (Admin)
     */
    createProduct(data: CreateProductDto): Promise<{
        brand: {
            name: string;
            id: string;
            isActive: boolean;
            slug: string;
            description: string | null;
            logo: string | null;
        } | null;
        category: {
            level: number;
            name: string;
            id: string;
            isActive: boolean;
            slug: string;
            image: string | null;
            parentId: string | null;
        };
        productVariants: {
            id: string;
            productId: string;
            sku: string;
            color: string | null;
            storage: string | null;
            ram: string | null;
            price: import("@prisma/client-runtime-utils").Decimal;
            stock: number;
            images: string[];
        }[];
    } & {
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        stock: number;
        images: string[];
        slug: string;
        description: string | null;
        shortDescription: string | null;
        basePrice: import("@prisma/client-runtime-utils").Decimal;
        salePrice: import("@prisma/client-runtime-utils").Decimal | null;
        specifications: import("@prisma/client/runtime/client").JsonValue | null;
        warrantyInfo: string | null;
        isFeatured: boolean;
        brandId: string | null;
        categoryId: string;
    }>;
    /**
     * Update product (Admin)
     */
    updateProduct(id: string, data: UpdateProductDto): Promise<{
        brand: {
            name: string;
            id: string;
            isActive: boolean;
            slug: string;
            description: string | null;
            logo: string | null;
        } | null;
        category: {
            level: number;
            name: string;
            id: string;
            isActive: boolean;
            slug: string;
            image: string | null;
            parentId: string | null;
        };
        productVariants: {
            id: string;
            productId: string;
            sku: string;
            color: string | null;
            storage: string | null;
            ram: string | null;
            price: import("@prisma/client-runtime-utils").Decimal;
            stock: number;
            images: string[];
        }[];
    } & {
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        stock: number;
        images: string[];
        slug: string;
        description: string | null;
        shortDescription: string | null;
        basePrice: import("@prisma/client-runtime-utils").Decimal;
        salePrice: import("@prisma/client-runtime-utils").Decimal | null;
        specifications: import("@prisma/client/runtime/client").JsonValue | null;
        warrantyInfo: string | null;
        isFeatured: boolean;
        brandId: string | null;
        categoryId: string;
    }>;
    /**
     * Soft delete product (Admin)
     */
    deleteProduct(id: string): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        stock: number;
        images: string[];
        slug: string;
        description: string | null;
        shortDescription: string | null;
        basePrice: import("@prisma/client-runtime-utils").Decimal;
        salePrice: import("@prisma/client-runtime-utils").Decimal | null;
        specifications: import("@prisma/client/runtime/client").JsonValue | null;
        warrantyInfo: string | null;
        isFeatured: boolean;
        brandId: string | null;
        categoryId: string;
    }>;
    /**
     * Delete permanently (if necessary)
     */
    hardDeleteProduct(id: string): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        stock: number;
        images: string[];
        slug: string;
        description: string | null;
        shortDescription: string | null;
        basePrice: import("@prisma/client-runtime-utils").Decimal;
        salePrice: import("@prisma/client-runtime-utils").Decimal | null;
        specifications: import("@prisma/client/runtime/client").JsonValue | null;
        warrantyInfo: string | null;
        isFeatured: boolean;
        brandId: string | null;
        categoryId: string;
    }>;
    /**
     * Restore soft-deleted product
     */
    restoreProduct(id: string): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        stock: number;
        images: string[];
        slug: string;
        description: string | null;
        shortDescription: string | null;
        basePrice: import("@prisma/client-runtime-utils").Decimal;
        salePrice: import("@prisma/client-runtime-utils").Decimal | null;
        specifications: import("@prisma/client/runtime/client").JsonValue | null;
        warrantyInfo: string | null;
        isFeatured: boolean;
        brandId: string | null;
        categoryId: string;
    }>;
    /**
     * Create Product Variant
     */
    createVariant(productId: string, data: any): Promise<{
        id: string;
        productId: string;
        sku: string;
        color: string | null;
        storage: string | null;
        ram: string | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        stock: number;
        images: string[];
    }>;
    /**
     * Update Product Variant
     */
    updateVariant(variantId: string, data: any): Promise<{
        id: string;
        productId: string;
        sku: string;
        color: string | null;
        storage: string | null;
        ram: string | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        stock: number;
        images: string[];
    }>;
    /**
     * Delete Product Variant
     */
    deleteVariant(variantId: string): Promise<{
        id: string;
        productId: string;
        sku: string;
        color: string | null;
        storage: string | null;
        ram: string | null;
        price: import("@prisma/client-runtime-utils").Decimal;
        stock: number;
        images: string[];
    }>;
}
export declare const productService: ProductService;
//# sourceMappingURL=product.service.d.ts.map