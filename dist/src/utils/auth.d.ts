import jwt from "jsonwebtoken";
export declare const generateToken: (payload: object) => string;
export declare const verifyToken: (token: string) => string | jwt.JwtPayload;
//# sourceMappingURL=auth.d.ts.map