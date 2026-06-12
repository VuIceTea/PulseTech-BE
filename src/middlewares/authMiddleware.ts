import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    if (
      typeof decoded === "string" ||
      !decoded ||
      typeof decoded !== "object"
    ) {
      return res
        .status(403)
        .json({ message: "Forbidden: Invalid token payload" });
    }

    const payload = decoded as Record<string, unknown>;
    const userId = payload.userId;
    const email = payload.email;
    const role = payload.role;

    if (
      typeof userId !== "string" ||
      typeof email !== "string" ||
      typeof role !== "string"
    ) {
      return res
        .status(403)
        .json({ message: "Forbidden: Invalid token payload" });
    }

    req.user = { userId, email, role };
    next();
  } catch (error) {
    return res
      .status(403)
      .json({ message: "Forbidden: Invalid or expired token" });
  }
};

export const authorizeRoles = (...roles: string[]): RequestHandler => {
  return (req, res, next) => {
    const currentRole = req.user?.role;

    if (!currentRole) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!roles.includes(currentRole)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
};
