import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import path from "node:path";
import connectDatabase from "./config/database";
import { connectRedis } from "./lib/redis";
import { errorHandler } from "./middlewares/error-handler";
import { notFoundHandler } from "./middlewares/not-found";
import { requestLogger } from "./middlewares/request-logger";
import authRouter from "./modules/auth";
import brandRouter from "./modules/brand";
import categoryRouter from "./modules/category";
import userRouter from "./modules/user";
import productRouter from "./modules/product";
import cartRouter from "./modules/cart";
import orderRouter from "./modules/order";
import paymentRouter from "./modules/payment/payment.routes";
const app = express();
const port = Number(process.env.PORT ?? 5000);
// VNPAY/MOMO notify endpoints require raw body for signature verification in some cases; keep json parser and urlencoded
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestLogger);
const publicDir = path.resolve(process.cwd(), "public");
app.use(express.static(publicDir));
app.get("/verify/success", (req, res) => res.sendFile(path.join(publicDir, "verify-success.html")));
app.get("/verify/fail", (req, res) => res.sendFile(path.join(publicDir, "verify-fail.html")));
app.use("/api/auth", authRouter);
app.use("/api/brands", brandRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);
app.use("/api/payments", paymentRouter);
app.use(notFoundHandler);
app.use(errorHandler);
async function bootstrap() {
    try {
        await connectDatabase();
        await connectRedis();
        console.log("Connected to the database successfully.");
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    }
    catch (error) {
        console.error("Database connection failed:", error);
        process.exit(1);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map