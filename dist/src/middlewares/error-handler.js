import { AppError } from "../utils/app-error";
export const errorHandler = (err, _req, res, _next) => {
    const isAppError = err instanceof AppError;
    const statusCode = isAppError ? err.statusCode : 500;
    const message = isAppError ? err.message : "Internal server error";
    const response = { message };
    if (process.env.NODE_ENV === "development") {
        response.stack = err.stack;
    }
    res.status(statusCode).json(response);
};
//# sourceMappingURL=error-handler.js.map