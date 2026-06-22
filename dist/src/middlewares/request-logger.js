export const requestLogger = (req, _res, next) => {
    if (process.env.NODE_ENV === "development") {
        console.log(`${req.method} ${req.originalUrl}`);
    }
    next();
};
//# sourceMappingURL=request-logger.js.map