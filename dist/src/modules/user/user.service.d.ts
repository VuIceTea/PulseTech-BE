import { ListUsersQuery, ListUsersResult, UpdateUserInput, UserResponse } from "./user.types";
export declare function listUsers(query: ListUsersQuery): Promise<ListUsersResult>;
export declare function getProfile(userId: string): Promise<UserResponse>;
export declare function updateUser(id: string, input: UpdateUserInput): Promise<UserResponse>;
export declare function deactivateUser(id: string): Promise<UserResponse>;
export declare function activeUser(id: string): Promise<UserResponse>;
//# sourceMappingURL=user.service.d.ts.map