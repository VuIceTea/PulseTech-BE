import { UserResponse } from "../user/user.types";
export type AuthResponse = {
    data: {
        user: UserResponse;
        token: string;
    };
    message: string;
};
//# sourceMappingURL=auth.types.d.ts.map