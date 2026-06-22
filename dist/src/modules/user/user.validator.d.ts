import type { CreateUserInput, ListUsersQuery, UpdateUserInput } from "./user.types";
export declare function parseUserId(idParam: unknown): string;
export declare function parseListUsersQuery(query: Record<string, unknown>): ListUsersQuery;
export declare function parseCreateUserBody(body: unknown): CreateUserInput;
export declare function parseUpdateUserBody(body: unknown): UpdateUserInput;
//# sourceMappingURL=user.validator.d.ts.map