import { Router } from "express";
import {
  createBrandHandler,
  deleteBrandHandler,
  restoreBrandHandler,
  hardDeleteBrandHandler,
  listAdminBrandsHandler,
  listBrandsHandler,
  updateBrandHandler,
} from "./brand.controller";
import { authenticate, authorizeRoles } from "../../middlewares/authMiddleware";
import { constants } from "../../config";

const router = Router();

router.get(
  "/admin",
  authenticate,
  authorizeRoles(constants.ROLES.ADMIN),
  listAdminBrandsHandler,
);
router.post(
  "/",
  authenticate,
  authorizeRoles(constants.ROLES.ADMIN),
  createBrandHandler,
);
router.patch(
  "/:id",
  authenticate,
  authorizeRoles(constants.ROLES.ADMIN),
  updateBrandHandler,
);
router.delete(
  "/:id",
  authenticate,
  authorizeRoles(constants.ROLES.ADMIN),
  deleteBrandHandler,
);
router.delete(
  "/:id/hard",
  authenticate,
  authorizeRoles(constants.ROLES.ADMIN),
  hardDeleteBrandHandler,
);
router.patch(
  "/:id/restore",
  authenticate,
  authorizeRoles(constants.ROLES.ADMIN),
  restoreBrandHandler,
);
router.get("/", listBrandsHandler);

export default router;
