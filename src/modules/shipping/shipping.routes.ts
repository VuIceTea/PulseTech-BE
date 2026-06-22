import { Router } from "express";
import { calculateShippingHandler } from "./shipping.controller";
import { authenticate } from "../../middlewares/authMiddleware";

const router = Router();
router.post("/calculate", authenticate, calculateShippingHandler);

export default router;
