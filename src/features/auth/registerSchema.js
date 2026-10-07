import { z } from "zod";
import { AUTH_LIMITS } from "@/constants/limits";
import { AUTH_MESSAGES } from "@/constants/messages";

export const INITIAL_REGISTER_FORM = {
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
};

export const REGISTER_FIELDS = [
    {
        id: "name",
        name: "name",
        label: "Full Name *",
        type: "text",
        required: true,
    },
    {
        id: "email",
        name: "email",
        label: "Email *",
        type: "email",
        required: true,
    },
    {
        id: "phone",
        name: "phone",
        label: "Mobile Number *",
        type: "tel",
        placeholder: "e.g. 9876543210",
        required: true,
    },
    {
        id: "password",
        name: "password",
        label: "Password *",
        type: "password",
        required: true,
    },
    {
        id: "confirmPassword",
        name: "confirmPassword",
        label: "Confirm Password *",
        type: "password",
        required: true,
    },
];

export const PASSWORD_RULES = Object.freeze([
    {
        id: "length",
        label: "At least 8 characters",
        check: (pwd) => pwd.length >= 8,
    },
    {
        id: "uppercase",
        label: "At least one uppercase letter (A-Z)",
        check: (pwd) => /[A-Z]/.test(pwd),
    },
    {
        id: "lowercase",
        label: "At least one lowercase letter (a-z)",
        check: (pwd) => /[a-z]/.test(pwd),
    },
    {
        id: "number",
        label: "At least one number (0-9)",
        check: (pwd) => /[0-9]/.test(pwd),
    },
    {
        id: "special",
        label: "At least one special character (e.g. @, #, $, !)",
        check: (pwd) => /[^A-Za-z0-9]/.test(pwd),
    },
]);

export const passwordSchema = z
    .string()
    .min(AUTH_LIMITS.PASSWORD_MIN_LENGTH, AUTH_MESSAGES.PASSWORD_MIN_LENGTH)
    .regex(/[A-Z]/, AUTH_MESSAGES.PASSWORD_UPPERCASE)
    .regex(/[a-z]/, AUTH_MESSAGES.PASSWORD_LOWERCASE)
    .regex(/[0-9]/, AUTH_MESSAGES.PASSWORD_NUMBER)
    .regex(/[^A-Za-z0-9]/, AUTH_MESSAGES.PASSWORD_SPECIAL);

const phoneRegex = /^[+]?[0-9\s\-().]{7,20}$/;

const baseRegisterSchema = z.object({
    name: z
        .string()
        .min(AUTH_LIMITS.NAME_MIN_LENGTH, AUTH_MESSAGES.NAME_REQUIRED),
    email: z.string().email(AUTH_MESSAGES.EMAIL_INVALID),
    phone: z
        .string()
        .min(1, AUTH_MESSAGES.PHONE_REQUIRED)
        .regex(phoneRegex, AUTH_MESSAGES.PHONE_INVALID),
    password: passwordSchema,
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
            return AUTH_MESSAGES.CONFIRM_PASSWORD_REQUIRED;
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
        phone: fieldErrors.phone?.[0] || "",
        password: fieldErrors.password?.[0] || "",
        confirmPassword: fieldErrors.confirmPassword?.[0] || "",
    };
}

/**
 * Calculates current field error and dependent confirmPassword error.
 *
 * @param {string} name - Field name.
 * @param {string} value - Current field value.
 * @param {Object} nextData - Current form state.
 * @param {string} prevConfirmErr - Previous confirmPassword error.
 * @returns {{ error: string, confirmErr: string }} Field error updates.
 */
export function getRegisterFieldErrors(name, value, nextData, prevConfirmErr) {
    const error = validateRegisterField(name, value, nextData);
    const confirmErr =
        name === "password" && nextData.confirmPassword
            ? validateRegisterField(
                  "confirmPassword",
                  nextData.confirmPassword,
                  nextData
              )
            : prevConfirmErr;
    return { error, confirmErr };
}
