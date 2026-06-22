import { Router } from "express";
import { createOrderHandler, getMyOrdersHandler, getOrderHandler, cancelOrderHandler, getAllOrdersHandler, updateOrderStatusHandler, getOrderDetailsHandler, vnpayReturnHandler, vnpayIpnHandler, momoNotifyHandler, momoReturnHandler, } from "./order.controller";
import { authenticate, authorizeRoles } from "../../middlewares/authMiddleware";
import { constants } from "../../config";
const router = Router();
// Customer routes
router.post("/", authenticate, createOrderHandler);
router.get("/my-orders", authenticate, getMyOrdersHandler);
router.get("/:id", authenticate, getOrderHandler);
router.patch("/:id/cancel", authenticate, cancelOrderHandler);
// Admin routes
router.get("/admin/all", authenticate, authorizeRoles(constants.ROLES.ADMIN), getAllOrdersHandler);
router.patch("/:id/status", authenticate, authorizeRoles(constants.ROLES.ADMIN), updateOrderStatusHandler);
router.get("/admin/:id", authenticate, authorizeRoles(constants.ROLES.ADMIN), getOrderDetailsHandler);
// Payment callbacks
router.post("/vnpay/ipn", vnpayIpnHandler);
router.get("/vnpay/return", vnpayReturnHandler);
router.post("/momo/notify", momoNotifyHandler);
router.get("/momo/return", momoReturnHandler);
export default router;
//# sourceMappingURL=order.routes.js.map