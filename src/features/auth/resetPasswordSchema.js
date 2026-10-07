import { z } from "zod";
import { AUTH_MESSAGES } from "@/constants/messages";
import { passwordSchema } from "./registerSchema";

export const INITIAL_RESET_PASSWORD_FORM = {
    email: "",
    phone: "",
    newPassword: "",
    confirmPassword: "",
};

export const RESET_PASSWORD_FIELDS = [
    {
        id: "email",
        name: "email",
        label: "Registered Email *",
        type: "email",
        placeholder: "e.g. user@campus.com",
        required: true,
    },
    {
        id: "phone",
        name: "phone",
        label: "Registered Mobile Number *",
        type: "tel",
        placeholder: "e.g. 9876543210",
        required: true,
    },
    {
        id: "newPassword",
        name: "newPassword",
        label: "New Password *",
        type: "password",
        required: true,
    },
    {
        id: "confirmPassword",
        name: "confirmPassword",
        label: "Confirm New Password *",
        type: "password",
        required: true,
    },
];

const phoneRegex = /^[+]?[0-9\s\-().]{7,20}$/;

const baseResetPasswordSchema = z.object({
    email: z.string().email(AUTH_MESSAGES.EMAIL_INVALID),
    phone: z
        .string()
        .min(1, AUTH_MESSAGES.PHONE_REQUIRED)
        .regex(phoneRegex, AUTH_MESSAGES.PHONE_INVALID),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
});

export const resetPasswordSchema = baseResetPasswordSchema.refine(
    (data) => data.newPassword === data.confirmPassword,
    {
        message: AUTH_MESSAGES.PASSWORDS_DO_NOT_MATCH,
        path: ["confirmPassword"],
    }
);

export function validateResetPasswordField(fieldName, value, allValues) {
    if (fieldName === "confirmPassword") {
        if (!value) {
            return AUTH_MESSAGES.CONFIRM_PASSWORD_REQUIRED;
        }
        if (allValues && value !== allValues.newPassword) {
            return AUTH_MESSAGES.PASSWORDS_DO_NOT_MATCH;
        }
        return "";
    }

    const fieldSchema = baseResetPasswordSchema.shape[fieldName];
    if (!fieldSchema) {
        return "";
    }
    const result = fieldSchema.safeParse(value);
    return result.success ? "" : result.error.issues[0]?.message || "";
}

export function mapResetPasswordErrors(fieldErrors) {
    return {
        email: fieldErrors.email?.[0] || "",
        phone: fieldErrors.phone?.[0] || "",
        newPassword: fieldErrors.newPassword?.[0] || "",
        confirmPassword: fieldErrors.confirmPassword?.[0] || "",
    };
}
