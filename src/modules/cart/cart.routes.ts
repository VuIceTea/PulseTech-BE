import { Router } from "express";
import {
  getCartHandler,
  addToCartHandler,
  updateCartItemHandler,
  removeFromCartHandler,
  clearCartHandler,
} from "./cart.controller";

const router = Router();

router.get("/", getCartHandler);
router.post("/add", addToCartHandler);
router.patch("/update/:id", updateCartItemHandler);
router.delete("/remove/:id", removeFromCartHandler);
router.delete("/clear", clearCartHandler);

export default router;
