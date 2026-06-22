import { Router } from "express";
import { createPaymentIntentHandler } from "./payment.controller";
import { authenticate } from "../../middlewares/authMiddleware";
const router = Router();
router.post("/intents", authenticate, createPaymentIntentHandler);
export default router;
//# sourceMappingURL=payment.routes.js.map