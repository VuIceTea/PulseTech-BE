import { UserResponse, CreateUserInput } from "../user/user.types";
import { AuthResponse } from "./auth.types";
export declare function loginUser(email: string, password: string): Promise<{
    user: UserResponse;
    token: string;
}>;
export declare function registerUser(input: CreateUserInput): Promise<AuthResponse>;
export declare function verifyEmail(token: string): Promise<UserResponse>;
export declare function getProfile(userId: string): Promise<UserResponse>;
//# sourceMappingURL=auth.service.d.ts.map