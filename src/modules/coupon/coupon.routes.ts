import { Router } from "express";
import {
  createCouponHandler,
  getPublicCouponsHandler,
  applyCouponHandler,
  getAllCouponsHandler,
  updateCouponHandler,
  deleteCouponHandler,
  validateCouponHandler,
} from "./coupon.controller";
import { authenticate, authorizeRoles } from "../../middlewares/authMiddleware";
import { constants } from "../../config";

const router = Router();

router.get("/public", getPublicCouponsHandler);
router.post("/apply", authenticate, applyCouponHandler);

// Admin
router.post(
  "/",
  authenticate,
  authorizeRoles(constants.ROLES.ADMIN),
  createCouponHandler,
);
router.get(
  "/admin",
  authenticate,
  authorizeRoles(constants.ROLES.ADMIN),
  getAllCouponsHandler,
);
router.patch(
  "/:id",
  authenticate,
  authorizeRoles(constants.ROLES.ADMIN),
  updateCouponHandler,
);
router.delete(
  "/:id",
  authenticate,
  authorizeRoles(constants.ROLES.ADMIN),
  deleteCouponHandler,
);

router.post("/validate", authenticate, validateCouponHandler);

export default router;
