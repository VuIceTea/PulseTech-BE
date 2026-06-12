import { Router } from "express";
import {
  createProductHandler,
  deleteProductHandler,
  getFeaturedProductsHandler,
  getProductBySlugHandler,
  listAdminProductsHandler,
  listProductsHandler,
  updateProductHandler,
  hardDeleteProductHandler,
  restoreProductHandler,
  createVariantHandler,
  updateVariantHandler,
  deleteVariantHandler,
} from "./product.controller";
import { authenticate, authorizeRoles } from "../../middlewares/authMiddleware";
import { constants } from "../../config";

const router = Router();

router.get(
  "/admin",
  authenticate,
  authorizeRoles(constants.ROLES.ADMIN),
  listAdminProductsHandler,
);
router.post(
  "/",
  authenticate,
  authorizeRoles(constants.ROLES.ADMIN),
  createProductHandler,
);
router.patch(
  "/:id",
  authenticate,
  authorizeRoles(constants.ROLES.ADMIN),
  updateProductHandler,
);
router.delete(
  "/:id",
  authenticate,
  authorizeRoles(constants.ROLES.ADMIN),
  deleteProductHandler,
);
router.delete(
  "/:id/hard",
  authenticate,
  authorizeRoles(constants.ROLES.ADMIN),
  hardDeleteProductHandler,
);
router.patch(
  "/:id/restore",
  authenticate,
  authorizeRoles(constants.ROLES.ADMIN),
  restoreProductHandler,
);

// Variants
router.post(
  "/:id/variants",
  authenticate,
  authorizeRoles(constants.ROLES.ADMIN),
  createVariantHandler,
);
router.patch(
  "/variants/:variantId",
  authenticate,
  authorizeRoles(constants.ROLES.ADMIN),
  updateVariantHandler,
);
router.delete(
  "/variants/:variantId",
  authenticate,
  authorizeRoles(constants.ROLES.ADMIN),
  deleteVariantHandler,
);

router.get("/featured", getFeaturedProductsHandler);
router.get("/", listProductsHandler);
router.get("/:slug", getProductBySlugHandler);

export default router;
