import { Request, Response, NextFunction, RequestHandler } from "express";
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const authorizeRoles: (...roles: string[]) => RequestHandler;
//# sourceMappingURL=authMiddleware.d.ts.map