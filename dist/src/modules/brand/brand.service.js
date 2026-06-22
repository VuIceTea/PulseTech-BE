import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/app-error";
export class BrandService {
    async listBrands(options = {}) {
        const where = {};
        if (!options.includeInactive) {
            where.isActive = true;
        }
        return prisma.brand.findMany({
            where,
            orderBy: { name: "asc" },
        });
    }
    async createBrand(data) {
        const existing = await prisma.brand.findUnique({
            where: { slug: data.slug },
            select: { id: true },
        });
        if (existing) {
            throw new AppError("Brand slug already exists", 409);
        }
        return prisma.brand.create({
            data: {
                name: data.name,
                slug: data.slug,
                logo: data.logo ?? null,
                description: data.description ?? null,
                isActive: data.isActive ?? true,
            },
        });
    }
    async updateBrand(id, data) {
        const existing = await prisma.brand.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!existing) {
            throw new AppError("Brand not found", 404);
        }
        if (data.slug) {
            const duplicate = await prisma.brand.findUnique({
                where: { slug: data.slug },
                select: { id: true },
            });
            if (duplicate && duplicate.id !== id) {
                throw new AppError("Brand slug already exists", 409);
            }
        }
        return prisma.brand.update({
            where: { id },
            data: {
                ...(data.name !== undefined ? { name: data.name } : {}),
                ...(data.slug !== undefined ? { slug: data.slug } : {}),
                ...(data.logo !== undefined ? { logo: data.logo ?? null } : {}),
                ...(data.description !== undefined
                    ? { description: data.description ?? null }
                    : {}),
                ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
            },
        });
    }
    async deleteBrand(id) {
        const existing = await prisma.brand.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!existing) {
            throw new AppError("Brand not found", 404);
        }
        return prisma.brand.update({
            where: { id },
            data: { isActive: false },
        });
    }
    async restoreBrand(id) {
        const existing = await prisma.brand.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!existing) {
            throw new AppError("Brand not found", 404);
        }
        return prisma.brand.update({
            where: { id },
            data: { isActive: true },
        });
    }
    async hardDeleteBrand(id) {
        const existing = await prisma.brand.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!existing) {
            throw new AppError("Brand not found", 404);
        }
        // Prevent hard delete if products are associated
        const linkedProduct = await prisma.product.findFirst({
            where: { brandId: id },
            select: { id: true },
        });
        if (linkedProduct) {
            throw new AppError("Cannot hard delete brand with associated products. Reassign or delete products first.", 400);
        }
        return prisma.brand.delete({ where: { id } });
    }
}
export const brandService = new BrandService();
//# sourceMappingURL=brand.service.js.map