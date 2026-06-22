import { AppError } from "../../utils/app-error";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function parseStringField(value, fieldName, options = {}) {
    const { required = false, minLength = 0 } = options;
    if (value === undefined || value === null) {
        if (required) {
            throw new AppError(`${fieldName} is required`, 400);
        }
        return undefined;
    }
    if (typeof value !== "string") {
        throw new AppError(`${fieldName} must be a string`, 400);
    }
    const trimmed = value.trim();
    if (required && trimmed.length === 0) {
        throw new AppError(`${fieldName} is required`, 400);
    }
    if (trimmed.length > 0 && trimmed.length < minLength) {
        throw new AppError(`${fieldName} must be at least ${minLength} characters`, 400);
    }
    return trimmed.length === 0 ? undefined : trimmed;
}
function parseBooleanField(value, fieldName) {
    if (value === undefined || value === null) {
        return undefined;
    }
    if (typeof value === "boolean") {
        return value;
    }
    if (typeof value === "string") {
        const normalized = value.toLowerCase();
        if (normalized === "true") {
            return true;
        }
        if (normalized === "false") {
            return false;
        }
    }
    throw new AppError(`${fieldName} must be a boolean`, 400);
}
function parsePositiveInt(value, fieldName, fallback) {
    if (value === undefined || value === null || value === "") {
        return fallback;
    }
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new AppError(`${fieldName} must be a positive integer`, 400);
    }
    return parsed;
}
export function parseUserId(idParam) {
    if (typeof idParam !== "string") {
        throw new AppError("Invalid user id", 400);
    }
    const id = idParam.trim();
    if (!UUID_REGEX.test(id)) {
        throw new AppError("Invalid user id", 400);
    }
    return id;
}
export function parseListUsersQuery(query) {
    const page = parsePositiveInt(query.page, "page", 1);
    const limitRaw = parsePositiveInt(query.limit, "limit", 20);
    const limit = Math.min(limitRaw, 100);
    const search = parseStringField(query.search, "search");
    const role = parseStringField(query.role, "role");
    const isActive = parseBooleanField(query.isActive, "isActive");
    return {
        page,
        limit,
        ...(search ? { search } : {}),
        ...(role ? { role } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
    };
}
export function parseCreateUserBody(body) {
    if (!body || typeof body !== "object") {
        throw new AppError("Invalid request body", 400);
    }
    const source = body;
    const email = parseStringField(source.email, "email", {
        required: true,
    });
    const password = parseStringField(source.password, "password", {
        required: true,
        minLength: 6,
    });
    if (!email || !EMAIL_REGEX.test(email)) {
        throw new AppError("email is invalid", 400);
    }
    const name = parseStringField(source.name, "name");
    const phone = parseStringField(source.phone, "phone");
    const avatar = parseStringField(source.avatar, "avatar");
    const role = parseStringField(source.role, "role");
    const isActive = parseBooleanField(source.isActive, "isActive");
    return {
        email,
        password: password,
        ...(name ? { name } : {}),
        ...(phone ? { phone } : {}),
        ...(avatar ? { avatar } : {}),
        ...(role ? { role } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
    };
}
export function parseUpdateUserBody(body) {
    if (!body || typeof body !== "object") {
        throw new AppError("Invalid request body", 400);
    }
    const source = body;
    const email = parseStringField(source.email, "email");
    const password = parseStringField(source.password, "password", {
        minLength: 6,
    });
    const name = parseStringField(source.name, "name");
    const phone = parseStringField(source.phone, "phone");
    const avatar = parseStringField(source.avatar, "avatar");
    const role = parseStringField(source.role, "role");
    const isActive = parseBooleanField(source.isActive, "isActive");
    if (email && !EMAIL_REGEX.test(email)) {
        throw new AppError("email is invalid", 400);
    }
    const payload = {
        ...(email ? { email } : {}),
        ...(password ? { password } : {}),
        ...(name ? { name } : {}),
        ...(phone ? { phone } : {}),
        ...(avatar ? { avatar } : {}),
        ...(role ? { role } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
    };
    if (Object.keys(payload).length === 0) {
        throw new AppError("No valid fields provided for update", 400);
    }
    return payload;
}
//# sourceMappingURL=user.validator.js.map