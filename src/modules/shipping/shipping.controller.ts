import type { RequestHandler } from "express";
import { shippingService } from "./shipping.service";
import { CalculateShippingDto } from "./dto/shipping.dto";
import { AppError } from "../../utils/app-error";

export const calculateShippingHandler: RequestHandler = async (req, res) => {
  try {
    const parsed = CalculateShippingDto.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error.issues[0]?.message ?? "Invalid payload",
      });
    }

    const result = await shippingService.calculateShipping({
      addressId: parsed.data.addressId,
      orderAmount: parsed.data.orderAmount,
      shippingMethodId: parsed.data.shippingMethodId ?? null,
    });

    res.json({ data: result });
  } catch (error: any) {
    const message = error instanceof AppError ? error.message : String(error);
    res.status(400).json({ message });
  }
};
