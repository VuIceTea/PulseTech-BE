import type { RequestHandler } from "express";

export const requestLogger: RequestHandler = (req, _res, next) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`${req.method} ${req.originalUrl}`);
  }
  next();
};
