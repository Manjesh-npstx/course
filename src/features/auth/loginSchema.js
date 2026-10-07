import { z } from "zod";
import { AUTH_LIMITS } from "@/constants/limits";
import { AUTH_MESSAGES } from "@/constants/messages";

export const LOGIN_FIELDS = [
    { id: "email", name: "email", label: "Email *", type: "email", required: true },
    { id: "password", name: "password", label: "Password *", type: "password", required: true },
];

/**
 * Validation schema for the user login form.
 */
export const loginSchema = z.object({
    email: z.string().email(AUTH_MESSAGES.EMAIL_INVALID),
    password: z
        .string()
        .min(
            AUTH_LIMITS.PASSWORD_MIN_LENGTH,
            AUTH_MESSAGES.PASSWORD_MIN_LENGTH
        ),
});

/**
 * Validates a single login field in real-time as the user types.
 *
 * @param {string} fieldName - Field name to validate.
 * @param {string} value - Current value typed.
 * @returns {string} Validation error message or empty string.
 */
export function validateLoginField(fieldName, value) {
    const fieldSchema = loginSchema.shape[fieldName];
    if (!fieldSchema) {
        return "";
    }
    const result = fieldSchema.safeParse(value);
    return result.success ? "" : result.error.issues[0]?.message || "";
}

/**
 * Maps flattened Zod errors to login form fields.
 *
 * @param {Object} fieldErrors - Flattened Zod error dictionary.
 * @returns {Object} Field error map.
 */
export function mapLoginErrors(fieldErrors) {
    return {
        email: fieldErrors.email?.[0] || "",
        password: fieldErrors.password?.[0] || "",
    };
}
