import { AppError } from "../../utils/app-error";
import { brandService } from "./brand.service";
import { CreateBrandDto } from "./dto/create-brand.dto";
import { UpdateBrandDto } from "./dto/update-brand.dto";
function getStatusCode(error, fallback) {
    return error instanceof AppError ? error.statusCode : fallback;
}
function parseId(value) {
    if (typeof value !== "string" || !value.trim()) {
        throw new AppError("Invalid brand id", 400);
    }
    return value.trim();
}
export const listBrandsHandler = async (_req, res) => {
    const brands = await brandService.listBrands();
    res.status(200).json({ data: brands });
};
export const listAdminBrandsHandler = async (_req, res) => {
    const brands = await brandService.listBrands({ includeInactive: true });
    res.status(200).json({ data: brands });
};
export const createBrandHandler = async (req, res) => {
    try {
        const parsed = CreateBrandDto.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: parsed.error.issues[0]?.message ?? "Invalid brand payload",
            });
        }
        const brand = await brandService.createBrand(parsed.data);
        res.status(201).json({ data: brand });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(getStatusCode(error, 400)).json({ message });
    }
};
export const updateBrandHandler = async (req, res) => {
    try {
        const id = parseId(req.params.id);
        const parsed = UpdateBrandDto.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: parsed.error.issues[0]?.message ?? "Invalid brand payload",
            });
        }
        if (Object.keys(parsed.data).length === 0) {
            return res.status(400).json({ message: "No fields to update" });
        }
        const brand = await brandService.updateBrand(id, parsed.data);
        res.status(200).json({ data: brand });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(getStatusCode(error, 400)).json({ message });
    }
};
export const deleteBrandHandler = async (req, res) => {
    try {
        const id = parseId(req.params.id);
        const brand = await brandService.deleteBrand(id);
        res.status(200).json({ data: brand });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(getStatusCode(error, 400)).json({ message });
    }
};
export const restoreBrandHandler = async (req, res) => {
    try {
        const id = parseId(req.params.id);
        const brand = await brandService.restoreBrand(id);
        res.status(200).json({ data: brand });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(getStatusCode(error, 400)).json({ message });
    }
};
export const hardDeleteBrandHandler = async (req, res) => {
    try {
        const id = parseId(req.params.id);
        const brand = await brandService.hardDeleteBrand(id);
        res.status(200).json({ data: brand });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(getStatusCode(error, 400)).json({ message });
    }
};
//# sourceMappingURL=brand.controller.js.map