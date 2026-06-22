import type { RequestHandler } from "express";
/**
 * Customer: Create order from cart
 */
export declare const createOrderHandler: RequestHandler;
/**
 * Customer: Get my orders
 */
export declare const getMyOrdersHandler: RequestHandler;
/**
 * Customer: Get order details
 */
export declare const getOrderHandler: RequestHandler;
/**
 * Customer: Cancel order
 */
export declare const cancelOrderHandler: RequestHandler;
/**
 * Admin: Get all orders
 */
export declare const getAllOrdersHandler: RequestHandler;
/**
 * Admin: Update order status
 */
export declare const updateOrderStatusHandler: RequestHandler;
/**
 * Admin: Get order details
 */
export declare const getOrderDetailsHandler: RequestHandler;
/**
 * VNPAY return handler
 */
export declare const vnpayReturnHandler: RequestHandler;
/**
 * VNPAY IPN/notify
 */
export declare const vnpayIpnHandler: RequestHandler;
/**
 * MOMO notify
 */
export declare const momoNotifyHandler: RequestHandler;
/**
 * MOMO return (redirect)
 */
export declare const momoReturnHandler: RequestHandler;
//# sourceMappingURL=order.controller.d.ts.map