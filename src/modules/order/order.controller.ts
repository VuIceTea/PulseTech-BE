import type { RequestHandler } from "express";
import { orderService } from "./order.service";
import { AppError } from "../../utils/app-error";
import { CreateOrderDto, UpdateOrderStatusDto } from "./dto/create-order.dto";

function getStatusCode(error: unknown, fallback: number): number {
  return error instanceof AppError ? error.statusCode : fallback;
}

function parseOrderId(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new AppError("Invalid order id", 400);
  }
  return value.trim();
}

/**
 * Customer: Create order from cart
 */
export const createOrderHandler: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const parsed = CreateOrderDto.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error.issues[0]?.message ?? "Invalid order payload",
      });
    }

    const order = await orderService.createOrder(userId, parsed.data);
    res.status(201).json({ data: order });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(getStatusCode(error, 400)).json({ message });
  }
};

/**
 * Customer: Get my orders
 */
export const getMyOrdersHandler: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const result = await orderService.getUserOrders(userId, { page, limit });
    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(getStatusCode(error, 400)).json({ message });
  }
};

/**
 * Customer: Get order details
 */
export const getOrderHandler: RequestHandler = async (req, res) => {
  try {
    const orderId = parseOrderId(req.params.id);
    const userId = (req as any).user?.id;

    const order = await orderService.getOrder(orderId, userId);
    res.status(200).json({ data: order });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(getStatusCode(error, 404)).json({ message });
  }
};

/**
 * Customer: Cancel order
 */
export const cancelOrderHandler: RequestHandler = async (req, res) => {
  try {
    const orderId = parseOrderId(req.params.id);
    const userId = (req as any).user?.id;

    // Verify user owns this order
    await orderService.getOrder(orderId, userId);

    const order = await orderService.cancelOrder(orderId);
    res.status(200).json({ data: order });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(getStatusCode(error, 400)).json({ message });
  }
};

/**
 * Admin: Get all orders
 */
export const getAllOrdersHandler: RequestHandler = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const status = req.query.status as string | undefined;
    const userId = req.query.userId as string | undefined;

    const result = await orderService.getAllOrders({
      page,
      limit,
      status,
      userId,
    });
    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(getStatusCode(error, 400)).json({ message });
  }
};

/**
 * Admin: Update order status
 */
export const updateOrderStatusHandler: RequestHandler = async (req, res) => {
  try {
    const orderId = parseOrderId(req.params.id);
    const parsed = UpdateOrderStatusDto.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error.issues[0]?.message ?? "Invalid payload",
      });
    }

    const order = await orderService.updateOrderStatus(orderId, parsed.data);
    res.status(200).json({ data: order });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(getStatusCode(error, 400)).json({ message });
  }
};

/**
 * Admin: Get order details
 */
export const getOrderDetailsHandler: RequestHandler = async (req, res) => {
  try {
    const orderId = parseOrderId(req.params.id);
    const order = await orderService.getOrder(orderId);
    res.status(200).json({ data: order });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(getStatusCode(error, 404)).json({ message });
  }
};
