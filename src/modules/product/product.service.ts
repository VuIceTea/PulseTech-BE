// src/features/product/product.service.ts
import { prisma } from "../../lib/prisma";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Prisma } from "../../../generated/prisma/client";
import { AppError } from "../../utils/app-error";

export class ProductService {
  /**
   * Get a list of products (with pagination, filtering, and search)
   */
  async getProducts(query: any = {}) {
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
    } = query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: Prisma.ProductWhereInput = { isActive: true };

    // Search by name or slug
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }

    if (categoryId) where.categoryId = categoryId;
    if (brandId) where.brandId = brandId;
    if (isFeatured !== undefined) where.isFeatured = isFeatured === "true";

    // Filter by Price
    if (minPrice || maxPrice) {
      where.basePrice = {};
      if (minPrice) where.basePrice.gte = Number(minPrice);
      if (maxPrice) where.basePrice.lte = Number(maxPrice);
    }

    // Sorting
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

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          brand: true,
          category: true,
          productVariants: true,
        },
        skip,
        take: Number(limit),
        orderBy,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
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
}

export const productService = new ProductService();
