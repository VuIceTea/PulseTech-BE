import type { RequestHandler } from "express";
import { promotionService } from "./promotion.service";
import { CreatePromotionDto, UpdatePromotionDto } from "./dto/promotion.dto";
import { AppError } from "../../utils/app-error";

function parseId(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new AppError("ID không hợp lệ", 400);
  }
  return value.trim();
}

export const createPromotionHandler: RequestHandler = async (req, res) => {
  try {
    const data = CreatePromotionDto.parse(req.body);
    const promotion = await promotionService.createPromotion(data);
    res.status(201).json({ data: promotion });
  } catch (error) {
    const message = error instanceof AppError ? error.message : String(error);
    res.status(400).json({ message });
  }
};

export const getAllPromotionsHandler: RequestHandler = async (req, res) => {
  const promotions = await promotionService.getAllPromotions();
  res.json({ data: promotions });
};

export const updatePromotionHandler: RequestHandler = async (req, res) => {
  try {
    const id = parseId(req.params.id);
    const data = UpdatePromotionDto.parse(req.body);
    const promotion = await promotionService.updatePromotion(id, data);
    res.json({ data: promotion });
  } catch (error) {
    const message = error instanceof AppError ? error.message : String(error);
    res.status(400).json({ message });
  }
};

export const deletePromotionHandler: RequestHandler = async (req, res) => {
  try {
    const id = parseId(req.params.id);
    await promotionService.deletePromotion(id);
    res.json({ message: "Promotion deleted successfully" });
  } catch (error) {
    const message = error instanceof AppError ? error.message : String(error);
    res.status(400).json({ message });
  }
};
