import { Router } from "express";
import {
  createPromotionHandler,
  getAllPromotionsHandler,
  updatePromotionHandler,
  deletePromotionHandler,
} from "./promotion.controller";
import { authenticate, authorizeRoles } from "../../middlewares/authMiddleware";
import { constants } from "../../config";

const router = Router();

router.post(
  "/",
  authenticate,
  authorizeRoles(constants.ROLES.ADMIN),
  createPromotionHandler,
);
router.get(
  "/admin",
  authenticate,
  authorizeRoles(constants.ROLES.ADMIN),
  getAllPromotionsHandler,
);
router.patch(
  "/:id",
  authenticate,
  authorizeRoles(constants.ROLES.ADMIN),
  updatePromotionHandler,
);
router.delete(
  "/:id",
  authenticate,
  authorizeRoles(constants.ROLES.ADMIN),
  deletePromotionHandler,
);

export default router;
