import { prisma } from "../../lib/prisma";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Prisma } from "../../../generated/prisma/client";
import { AppError } from "../../utils/app-error";

export class ProductService {
  private buildProductListQuery(
    query: any = {},
    options: { includeInactive?: boolean } = {},
  ) {
    const {
      page = 1,
      limit = 20,
      search,
      categoryId,
      brandId,
      minPrice,
      maxPrice,
      sort = "newest",
      isFeatured,
      isActive,
    } = query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: Prisma.ProductWhereInput = {};

    if (!options.includeInactive) {
      where.isActive = true;
    } else if (isActive !== undefined) {
      where.isActive = isActive === true || isActive === "true";
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }

    if (categoryId) where.categoryId = categoryId;
    if (brandId) where.brandId = brandId;
    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured === true || isFeatured === "true";
    }

    if (minPrice || maxPrice) {
      where.basePrice = {};
      if (minPrice) where.basePrice.gte = Number(minPrice);
      if (maxPrice) where.basePrice.lte = Number(maxPrice);
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
    switch (sort) {
      case "price_asc":
        orderBy = { basePrice: "asc" };
        break;
      case "price_desc":
        orderBy = { basePrice: "desc" };
        break;
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    return {
      skip,
      take: Number(limit),
      page: Number(page),
      limit: Number(limit),
      where,
      orderBy,
    };
  }

  /**
   * Get a list of products (with pagination, filtering, and search)
   */
  async getProducts(query: any = {}) {
    const { skip, take, page, limit, where, orderBy } =
      this.buildProductListQuery(query, { includeInactive: false });

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          brand: true,
          category: true,
          productVariants: true,
        },
        skip,
        take,
        orderBy,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a list of products (Admin, including inactive)
   */
  async getAdminProducts(query: any = {}) {
    const { skip, take, page, limit, where, orderBy } =
      this.buildProductListQuery(query, { includeInactive: true });

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          brand: true,
          category: true,
          productVariants: true,
        },
        skip,
        take,
        orderBy,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * get all product by slug
   */
  async getProductBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug, isActive: true },
      include: {
        brand: true,
        category: true,
        productVariants: true,
        reviews: {
          where: { isApproved: true },
          include: {
            user: { select: { name: true, avatar: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!product) {
      throw new AppError("Sản phẩm không tồn tại", 404);
    }

    return product;
  }

  /**
   * Select the featured product.
   */
  async getFeaturedProducts(limit = 8) {
    return await prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      include: { brand: true, category: true },
      take: limit,
      orderBy: { createdAt: "desc" },
    });
  }

  // ==================== ADMIN ====================

  /**
   * Create new product (Admin)
   */
  async createProduct(data: CreateProductDto) {
    // Business validation
    if (data.salePrice && data.salePrice >= data.basePrice) {
      throw new AppError("Giá khuyến mãi phải nhỏ hơn giá gốc", 400);
    }

    return await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        shortDescription: data.shortDescription ?? null,
        basePrice: data.basePrice,
        salePrice: data.salePrice ?? null,
        stock: data.stock,
        images: data.images,
        specifications: (data.specifications as Prisma.InputJsonValue) ?? null,
        warrantyInfo: data.warrantyInfo ?? null,
        isFeatured: data.isFeatured,
        brandId: data.brandId ?? null,
        categoryId: data.categoryId,
      },
      include: {
        brand: true,
        category: true,
        productVariants: true,
      },
    });
  }

  /**
   * Update product (Admin)
   */
  async updateProduct(id: string, data: UpdateProductDto) {
    const updateData: Prisma.ProductUpdateInput = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.description !== undefined)
      updateData.description = data.description ?? null;
    if (data.shortDescription !== undefined)
      updateData.shortDescription = data.shortDescription ?? null;
    if (data.basePrice !== undefined) updateData.basePrice = data.basePrice;
    if (data.salePrice !== undefined)
      updateData.salePrice = data.salePrice ?? null;
    if (data.stock !== undefined) updateData.stock = data.stock;
    if (data.images !== undefined) updateData.images = data.images;
    if (data.specifications !== undefined)
      updateData.specifications =
        (data.specifications as Prisma.InputJsonValue) ?? null;
    if (data.warrantyInfo !== undefined)
      updateData.warrantyInfo = data.warrantyInfo ?? null;
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    // Relationship
    if (data.brandId !== undefined) {
      updateData.brand = data.brandId
        ? { connect: { id: data.brandId } }
        : { disconnect: true };
    }
    if (data.categoryId !== undefined) {
      updateData.category = { connect: { id: data.categoryId } };
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: { brand: true, category: true, productVariants: true },
    });

    return product;
  }

  /**
   * Soft delete product (Admin)
   */
  async deleteProduct(id: string) {
    return await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Delete permanently (if necessary)
   */
  async hardDeleteProduct(id: string) {
    return await prisma.product.delete({ where: { id } });
  }

  /**
   * Restore soft-deleted product
   */
  async restoreProduct(id: string) {
    return await prisma.product.update({
      where: { id },
      data: { isActive: true },
    });
  }

  // ==================== VARIANTS ====================

  /**
   * Create Product Variant
   */
  async createVariant(productId: string, data: any) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { productVariants: true },
    });

    if (!product) {
      throw new AppError("Sản phẩm không tồn tại", 404);
    }

    // Validate stock
    const totalVariantStock = product.productVariants.reduce(
      (sum, variant) => sum + variant.stock,
      0,
    );
    if (totalVariantStock + data.stock > product.stock) {
      throw new AppError(
        "Tổng số lượng biến thể không được vượt quá tồn kho của sản phẩm ",
        400,
      );
    }

    // Check if SKU exists
    const existingVariant = await prisma.productVariant.findUnique({
      where: { sku: data.sku },
    });

    if (existingVariant) {
      throw new AppError("Mã SKU đã tồn tại", 400);
    }

    return await prisma.productVariant.create({
      data: {
        productId,
        sku: data.sku,
        color: data.color ?? null,
        storage: data.storage ?? null,
        ram: data.ram ?? null,
        price: data.price,
        stock: data.stock,
        images: data.images ?? [],
      },
    });
  }

  /**
   * Update Product Variant
   */
  async updateVariant(variantId: string, data: any) {
    const variantToUpdate = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: { include: { productVariants: true } } },
    });

    if (!variantToUpdate) {
      throw new AppError("Biến thể không tồn tại", 404);
    }

    const product = variantToUpdate.product;

    // Validate stock if it's being updated
    if (data.stock !== undefined) {
      const otherVariantsStock = product.productVariants
        .filter((v) => v.id !== variantId)
        .reduce((sum, v) => sum + v.stock, 0);

      if (otherVariantsStock + data.stock > product.stock) {
        throw new AppError(
          "Tổng số lượng biến thể không được vượt quá tồn kho của sản phẩm",
          400,
        );
      }
    }

    if (data.sku) {
      const existingVariant = await prisma.productVariant.findFirst({
        where: { sku: data.sku, id: { not: variantId } },
      });

      if (existingVariant) {
        throw new AppError("Mã SKU này đã tồn tại", 400);
      }
    }

    return await prisma.productVariant.update({
      where: { id: variantId },
      data: {
        sku: data.sku,
        color: data.color,
        storage: data.storage,
        ram: data.ram,
        price: data.price,
        stock: data.stock,
        images: data.images,
      },
    });
  }

  /**
   * Delete Product Variant
   */
  async deleteVariant(variantId: string) {
    return await prisma.productVariant.delete({
      where: { id: variantId },
    });
  }
}

export const productService = new ProductService();
