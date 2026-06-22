import { Router } from "express";
import { createCategoryHandler, deleteCategoryHandler, restoreCategoryHandler, hardDeleteCategoryHandler, listAdminCategoriesHandler, listCategoriesHandler, updateCategoryHandler, } from "./category.controller";
import { authenticate, authorizeRoles } from "../../middlewares/authMiddleware";
import { constants } from "../../config";
const router = Router();
router.get("/admin", authenticate, authorizeRoles(constants.ROLES.ADMIN), listAdminCategoriesHandler);
router.post("/", authenticate, authorizeRoles(constants.ROLES.ADMIN), createCategoryHandler);
router.patch("/:id", authenticate, authorizeRoles(constants.ROLES.ADMIN), updateCategoryHandler);
router.delete("/:id", authenticate, authorizeRoles(constants.ROLES.ADMIN), deleteCategoryHandler);
router.delete("/:id/hard", authenticate, authorizeRoles(constants.ROLES.ADMIN), hardDeleteCategoryHandler);
router.patch("/:id/restore", authenticate, authorizeRoles(constants.ROLES.ADMIN), restoreCategoryHandler);
router.get("/", listCategoriesHandler);
export default router;
//# sourceMappingURL=category.routes.js.map