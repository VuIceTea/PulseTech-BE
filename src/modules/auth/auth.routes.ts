import { Router } from "express";
import {
  loginHandler,
  registerHandler,
  verifyEmailHandler,
} from "./auth.controller";

const router = Router();

router.post("/login", loginHandler);
router.post("/register", registerHandler);
router.get("/verify-email", verifyEmailHandler);

export default router;
