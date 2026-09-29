import { z } from "zod";
import { AUTH_LIMITS } from "@/constants/limits";
import { AUTH_MESSAGES } from "@/constants/messages";

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
