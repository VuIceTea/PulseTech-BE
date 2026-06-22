import { AppError } from "../../utils/app-error";
import { categoryService } from "./category.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
function getStatusCode(error, fallback) {
    return error instanceof AppError ? error.statusCode : fallback;
}
function parseId(value) {
    if (typeof value !== "string" || !value.trim()) {
        throw new AppError("Invalid category id", 400);
    }
    return value.trim();
}
export const listCategoriesHandler = async (_req, res) => {
    const categories = await categoryService.listCategories();
    res.status(200).json({ data: categories });
};
export const listAdminCategoriesHandler = async (_req, res) => {
    const categories = await categoryService.listCategories({
        includeInactive: true,
    });
    res.status(200).json({ data: categories });
};
export const createCategoryHandler = async (req, res) => {
    try {
        const parsed = CreateCategoryDto.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: parsed.error.issues[0]?.message ?? "Invalid category payload",
            });
        }
        const category = await categoryService.createCategory(parsed.data);
        res.status(201).json({ data: category });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(getStatusCode(error, 400)).json({ message });
    }
};
export const updateCategoryHandler = async (req, res) => {
    try {
        const id = parseId(req.params.id);
        const parsed = UpdateCategoryDto.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: parsed.error.issues[0]?.message ?? "Invalid category payload",
            });
        }
        if (Object.keys(parsed.data).length === 0) {
            return res.status(400).json({ message: "No fields to update" });
        }
        const category = await categoryService.updateCategory(id, parsed.data);
        res.status(200).json({ data: category });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(getStatusCode(error, 400)).json({ message });
    }
};
export const deleteCategoryHandler = async (req, res) => {
    try {
        const id = parseId(req.params.id);
        const category = await categoryService.deleteCategory(id);
        res.status(200).json({ data: category });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(getStatusCode(error, 400)).json({ message });
    }
};
export const restoreCategoryHandler = async (req, res) => {
    try {
        const id = parseId(req.params.id);
        const category = await categoryService.restoreCategory(id);
        res.status(200).json({ data: category });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(getStatusCode(error, 400)).json({ message });
    }
};
export const hardDeleteCategoryHandler = async (req, res) => {
    try {
        const id = parseId(req.params.id);
        const category = await categoryService.hardDeleteCategory(id);
        res.status(200).json({ data: category });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(getStatusCode(error, 400)).json({ message });
    }
};
//# sourceMappingURL=category.controller.js.map