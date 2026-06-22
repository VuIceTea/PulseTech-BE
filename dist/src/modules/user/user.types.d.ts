export type UserResponse = {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    avatar: string | null;
    role: string;
    isActive: boolean;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
};
export type UserInput = {
    email: string;
    password: string;
};
export type ListUsersQuery = {
    page: number;
    limit: number;
    search?: string;
    role?: string;
    isActive?: boolean;
};
export type CreateUserInput = {
    email: string;
    password: string;
    name?: string;
    phone?: string;
    avatar?: string;
    role?: string;
    isActive?: boolean;
};
export type UpdateUserInput = {
    email?: string;
    password?: string;
    name?: string;
    phone?: string;
    avatar?: string;
    role?: string;
    isActive?: boolean;
};
export type ListUsersResult = {
    data: UserResponse[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
};
//# sourceMappingURL=user.types.d.ts.map