import { Router } from "express";
import healthRouter from "./health";
import userRouter from "../modules/user";

const router = Router();

router.use("/health", healthRouter);
router.use("/users", userRouter);

export default router;
