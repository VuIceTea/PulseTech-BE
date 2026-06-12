import type { RequestHandler } from "express";
import { productService } from "./product.service";
import { AppError } from "../../utils/app-error";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import {
  CreateProductVariantDto,
  UpdateProductVariantDto,
} from "./dto/variant.dto";
import {
  GetAdminProductsQueryDto,
  GetProductsQueryDto,
} from "./dto/get-products-query.dto";

function getStatusCode(error: unknown, fallback: number): number {
  return error instanceof AppError ? error.statusCode : fallback;
}

function parseProductId(value: unknown): string {
  if (typeof value !== "string") {
    throw new AppError("Invalid product id", 400);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw new AppError("Invalid product id", 400);
  }

  return trimmed;
}

export const listProductsHandler: RequestHandler = async (req, res) => {
  try {
    const parsed = GetProductsQueryDto.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error.issues[0]?.message ?? "Invalid query",
      });
    }

    const result = await productService.getProducts(parsed.data);
    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(getStatusCode(error, 400)).json({ message });
  }
};

export const listAdminProductsHandler: RequestHandler = async (req, res) => {
  try {
    const parsed = GetAdminProductsQueryDto.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error.issues[0]?.message ?? "Invalid query",
      });
    }

    const result = await productService.getAdminProducts(parsed.data);
    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(getStatusCode(error, 400)).json({ message });
  }
};

export const getProductBySlugHandler: RequestHandler = async (req, res) => {
  try {
    const slug = typeof req.params.slug === "string" ? req.params.slug : "";
    if (!slug.trim()) {
      return res.status(400).json({ message: "Invalid slug" });
    }

    const product = await productService.getProductBySlug(slug.trim());
    res.status(200).json({ data: product });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(getStatusCode(error, 404)).json({ message });
  }
};

export const getFeaturedProductsHandler: RequestHandler = async (req, res) => {
  try {
    const limitRaw = req.query.limit;
    const limit =
      typeof limitRaw === "string" && limitRaw.trim()
        ? Number(limitRaw)
        : undefined;
    const products = await productService.getFeaturedProducts(
      limit && Number.isFinite(limit) ? limit : undefined,
    );
    res.status(200).json({ data: products });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(getStatusCode(error, 400)).json({ message });
  }
};

export const createProductHandler: RequestHandler = async (req, res) => {
  try {
    const parsed = CreateProductDto.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error.issues[0]?.message ?? "Invalid product payload",
      });
    }

    const product = await productService.createProduct(parsed.data);
    res.status(201).json({ data: product });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(getStatusCode(error, 400)).json({ message });
  }
};

export const updateProductHandler: RequestHandler = async (req, res) => {
  try {
    const productId = parseProductId(req.params.id);
    const parsed = UpdateProductDto.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error.issues[0]?.message ?? "Invalid product payload",
      });
    }

    if (Object.keys(parsed.data).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const product = await productService.updateProduct(productId, parsed.data);
    res.status(200).json({ data: product });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(getStatusCode(error, 400)).json({ message });
  }
};

export const deleteProductHandler: RequestHandler = async (req, res) => {
  try {
    const productId = parseProductId(req.params.id);
    const product = await productService.deleteProduct(productId);
    res.status(200).json({ data: product });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(getStatusCode(error, 400)).json({ message });
  }
};

export const hardDeleteProductHandler: RequestHandler = async (req, res) => {
  try {
    const productId = parseProductId(req.params.id);
    const product = await productService.hardDeleteProduct(productId);
    res.status(200).json({ data: product });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(getStatusCode(error, 400)).json({ message });
  }
};

export const restoreProductHandler: RequestHandler = async (req, res) => {
  try {
    const productId = parseProductId(req.params.id);
    const product = await productService.restoreProduct(productId);
    res.status(200).json({ data: product });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(getStatusCode(error, 400)).json({ message });
  }
};

export const createVariantHandler: RequestHandler = async (req, res) => {
  try {
    const productId = parseProductId(req.params.id);
    const parsed = CreateProductVariantDto.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error.issues[0]?.message ?? "Invalid payload",
      });
    }

    const variant = await productService.createVariant(productId, parsed.data);
    res.status(201).json({ data: variant });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(getStatusCode(error, 400)).json({ message });
  }
};

export const updateVariantHandler: RequestHandler = async (req, res) => {
  try {
    const variantId = parseProductId(req.params.variantId);
    const parsed = UpdateProductVariantDto.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error.issues[0]?.message ?? "Invalid payload",
      });
    }

    if (Object.keys(parsed.data).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const variant = await productService.updateVariant(variantId, parsed.data);
    res.status(200).json({ data: variant });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(getStatusCode(error, 400)).json({ message });
  }
};

export const deleteVariantHandler: RequestHandler = async (req, res) => {
  try {
    const variantId = parseProductId(req.params.variantId);
    await productService.deleteVariant(variantId);
    res.status(200).json({ message: "Xóa biến thể thành công" });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(getStatusCode(error, 400)).json({ message });
  }
};
