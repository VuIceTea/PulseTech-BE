// file: cart.routes.ts
import { Router } from "express";
import { optionalAuthenticate } from "../../middlewares/authMiddleware";
import {
  getCartHandler,
  addToCartHandler,
  updateCartItemHandler,
  removeFromCartHandler,
  clearCartHandler,
} from "./cart.controller";

const router = Router();

router.use(optionalAuthenticate);

router.get("/", getCartHandler);
router.post("/add", addToCartHandler);
router.patch("/update/:id", updateCartItemHandler);
router.delete("/remove/:id", removeFromCartHandler);
router.delete("/clear", clearCartHandler);

export default router;
