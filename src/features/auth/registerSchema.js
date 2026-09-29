import { z } from "zod";
import { AUTH_LIMITS } from "@/constants/limits";
import { AUTH_MESSAGES } from "@/constants/messages";

const baseRegisterSchema = z.object({
    name: z
        .string()
        .min(AUTH_LIMITS.NAME_MIN_LENGTH, AUTH_MESSAGES.NAME_REQUIRED),
    email: z.string().email(AUTH_MESSAGES.EMAIL_INVALID),
    password: z
        .string()
        .min(
            AUTH_LIMITS.PASSWORD_MIN_LENGTH,
            AUTH_MESSAGES.PASSWORD_MIN_LENGTH
        ),
    confirmPassword: z.string(),
});

/**
 * Validation schema for the complete registration form.
 */
export const registerSchema = baseRegisterSchema.refine(
    (data) => data.password === data.confirmPassword,
    {
        message: AUTH_MESSAGES.PASSWORDS_DO_NOT_MATCH,
        path: ["confirmPassword"],
    }
);

/**
 * Validates a single registration field in real-time as the user types.
 *
 * @param {string} fieldName - Field name to validate.
 * @param {string} value - Current value typed.
 * @param {Object} allValues - Full form state to validate cross-field dependencies.
 * @returns {string} Validation error message or empty string.
 */
export function validateRegisterField(fieldName, value, allValues) {
    if (fieldName === "confirmPassword") {
        if (!value) {
            return AUTH_MESSAGES.PASSWORD_MIN_LENGTH;
        }
        if (allValues && value !== allValues.password) {
            return AUTH_MESSAGES.PASSWORDS_DO_NOT_MATCH;
        }
        return "";
    }

    const fieldSchema = baseRegisterSchema.shape[fieldName];
    if (!fieldSchema) {
        return "";
    }
    const result = fieldSchema.safeParse(value);
    return result.success ? "" : result.error.issues[0]?.message || "";
}

/**
 * Maps flattened Zod errors into a clean key-value error map.
 *
 * @param {Object} fieldErrors - Flattened Zod error dictionary.
 * @returns {Object} Clean field error map.
 */
export function mapRegisterErrors(fieldErrors) {
    return {
        name: fieldErrors.name?.[0] || "",
        email: fieldErrors.email?.[0] || "",
        password: fieldErrors.password?.[0] || "",
        confirmPassword: fieldErrors.confirmPassword?.[0] || "",
    };
}
