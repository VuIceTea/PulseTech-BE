import { Router } from "express";
import { authenticate } from "../../middlewares/authMiddleware";
import { addAddressHandler, listAddressesHandler, updateAddressHandler, deleteAddressHandler, } from "./address.controller";
const router = Router();
router.post("/", authenticate, addAddressHandler);
router.get("/", authenticate, listAddressesHandler);
router.patch("/:id", authenticate, updateAddressHandler);
router.delete("/:id", authenticate, deleteAddressHandler);
export default router;
//# sourceMappingURL=address.routes.js.map