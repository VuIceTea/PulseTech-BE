import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/app-error";
export class CategoryService {
    async listCategories(options = {}) {
        const where = {};
        if (!options.includeInactive) {
            where.isActive = true;
        }
        return prisma.category.findMany({
            where,
            orderBy: [{ level: "asc" }, { name: "asc" }],
            include: {
                parent: { select: { id: true, name: true, slug: true } },
            },
        });
    }
    async createCategory(data) {
        const existing = await prisma.category.findUnique({
            where: { slug: data.slug },
            select: { id: true },
        });
        if (existing) {
            throw new AppError("Category slug already exists", 409);
        }
        let level = 0;
        let parentId = null;
        if (data.parentId) {
            const parent = await prisma.category.findUnique({
                where: { id: data.parentId },
                select: { id: true, level: true },
            });
            if (!parent) {
                throw new AppError("Parent category not found", 404);
            }
            parentId = parent.id;
            level = parent.level + 1;
        }
        return prisma.category.create({
            data: {
                name: data.name,
                slug: data.slug,
                image: data.image ?? null,
                parentId,
                level,
                isActive: data.isActive ?? true,
            },
        });
    }
    async updateCategory(id, data) {
        const existing = await prisma.category.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!existing) {
            throw new AppError("Category not found", 404);
        }
        if (data.slug) {
            const duplicate = await prisma.category.findUnique({
                where: { slug: data.slug },
                select: { id: true },
            });
            if (duplicate && duplicate.id !== id) {
                throw new AppError("Category slug already exists", 409);
            }
        }
        let parentId;
        let level;
        if (data.parentId !== undefined) {
            if (data.parentId === id) {
                throw new AppError("Category cannot be its own parent", 400);
            }
            if (data.parentId === null) {
                parentId = null;
                level = 0;
            }
            else {
                const parent = await prisma.category.findUnique({
                    where: { id: data.parentId },
                    select: { id: true, level: true },
                });
                if (!parent) {
                    throw new AppError("Parent category not found", 404);
                }
                parentId = parent.id;
                level = parent.level + 1;
            }
        }
        const updateData = {};
        if (data.name !== undefined) {
            updateData.name = data.name;
        }
        if (data.slug !== undefined) {
            updateData.slug = data.slug;
        }
        if (data.image !== undefined) {
            updateData.image = data.image ?? null;
        }
        if (data.parentId !== undefined) {
            updateData.parentId = parentId ?? null;
        }
        if (level !== undefined) {
            updateData.level = level;
        }
        if (data.isActive !== undefined) {
            updateData.isActive = data.isActive;
        }
        return prisma.category.update({
            where: { id },
            data: updateData,
        });
    }
    async deleteCategory(id) {
        const existing = await prisma.category.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!existing) {
            throw new AppError("Category not found", 404);
        }
        return prisma.category.update({
            where: { id },
            data: { isActive: false },
        });
    }
    async restoreCategory(id) {
        const existing = await prisma.category.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!existing) {
            throw new AppError("Category not found", 404);
        }
        return prisma.category.update({
            where: { id },
            data: { isActive: true },
        });
    }
    async hardDeleteCategory(id) {
        const existing = await prisma.category.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!existing) {
            throw new AppError("Category not found", 404);
        }
        // Prevent hard delete if products are associated
        const linkedProduct = await prisma.product.findFirst({
            where: { categoryId: id },
            select: { id: true },
        });
        if (linkedProduct) {
            throw new AppError("Cannot hard delete category with associated products. Reassign or delete products first.", 400);
        }
        return prisma.category.delete({ where: { id } });
    }
}
export const categoryService = new CategoryService();
//# sourceMappingURL=category.service.js.map