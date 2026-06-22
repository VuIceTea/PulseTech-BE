// src/modules/promotion/promotion.service.ts
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/app-error";
import { CreatePromotionDto, UpdatePromotionDto } from "./dto/promotion.dto";

export class PromotionService {
  async createPromotion(data: CreatePromotionDto) {
    const existing = await prisma.promotion.findUnique({
      where: { productVariantId: data.productVariantId },
    });

    if (existing) {
      throw new AppError(
        "Biến thể này đã có chương trình khuyến mãi đang chạy",
        400,
      );
    }

    return prisma.promotion.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        discountValue: data.discountValue,
        discountType: data.discountType,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        productVariantId: data.productVariantId,
        isActive: data.isActive,
      },
      include: { productVariant: true },
    });
  }

  async getActivePromotionByVariant(variantId: string) {
    return prisma.promotion.findFirst({
      where: {
        productVariantId: variantId,
        isActive: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
    });
  }

  /**
   * Enrich product với promotion
   */
  async getProductWithPromotion(product: any) {
    if (
      !product ||
      !product.productVariants ||
      !Array.isArray(product.productVariants)
    ) {
      return product;
    }

    product.productVariants = await Promise.all(
      product.productVariants.map(async (variant: any) => {
        const promotion = await this.getActivePromotionByVariant(variant.id);

        const variantPrice = Number(variant.price || product.basePrice);

        let displayPrice = variantPrice;
        let originalPrice = variantPrice;
        let hasPromotion = false;
        let promotionData = null;

        if (promotion) {
          hasPromotion = true;
          promotionData = {
            id: promotion.id,
            name: promotion.name,
            discountValue: Number(promotion.discountValue),
            discountType: promotion.discountType,
            endDate: promotion.endDate,
          };

          if (promotion.discountType === "PERCENTAGE") {
            displayPrice =
              variantPrice * (1 - Number(promotion.discountValue) / 100);
          } else {
            displayPrice = variantPrice - Number(promotion.discountValue);
          }
          originalPrice = variantPrice;
        } else if (product.salePrice != null) {
          displayPrice = Number(product.salePrice);
          originalPrice = variantPrice;
        }

        return {
          ...variant,
          displayPrice: Math.max(0, Math.round(displayPrice)),
          originalPrice: Math.round(originalPrice),
          hasPromotion,
          promotion: promotionData,
        };
      }),
    );

    return product;
  }

  async getAllPromotions() {
    return prisma.promotion.findMany({
      include: {
        productVariant: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async updatePromotion(id: string, data: UpdatePromotionDto) {
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description ?? null;
    if (data.discountValue !== undefined)
      updateData.discountValue = data.discountValue;
    if (data.discountType !== undefined)
      updateData.discountType = data.discountType;
    if (data.startDate !== undefined)
      updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate);
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    return prisma.promotion.update({
      where: { id },
      data: updateData,
      include: { productVariant: { include: { product: true } } },
    });
  }

  async deletePromotion(id: string) {
    return prisma.promotion.delete({ where: { id } });
  }
}

export const promotionService = new PromotionService();
