import { Router } from "express";
import {
  deactivateUserHandler,
  listUsersHandler,
  updateProfileHandler,
} from "./user.controller";
import { authenticate } from "../../middlewares/authMiddleware";
import { getProfileHandler } from "../auth/auth.controller";
import addressRouter from "../address";

const router = Router();

router.get("/", listUsersHandler);
router.get("/profile", authenticate, getProfileHandler);
router.patch("/profile", authenticate, updateProfileHandler);
router.use("/address", authenticate, addressRouter);
router.delete("/:id", authenticate, deactivateUserHandler);

export default router;
