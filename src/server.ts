import "dotenv/config";
import express from "express";
import path from "node:path";
import connectDatabase from "./config/database";
import { errorHandler } from "./middlewares/error-handler";
import { notFoundHandler } from "./middlewares/not-found";
import { requestLogger } from "./middlewares/request-logger";
import authRouter from "./modules/auth";
import userRouter from "./modules/user";

const app = express();
const port = Number(process.env.PORT ?? 5000);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Serve static public assets (verification pages)
const publicDir = path.resolve(process.cwd(), "public");
app.use(express.static(publicDir));
app.get("/verify/success", (req, res) =>
  res.sendFile(path.join(publicDir, "verify-success.html")),
);
app.get("/verify/fail", (req, res) =>
  res.sendFile(path.join(publicDir, "verify-fail.html")),
);

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);

app.use(notFoundHandler);
app.use(errorHandler);

async function bootstrap() {
  try {
    await connectDatabase();
    console.log("Connected to the database successfully.");

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
}

bootstrap();
