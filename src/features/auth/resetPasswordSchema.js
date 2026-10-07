import { z } from "zod";
import { AUTH_MESSAGES } from "@/constants/messages";
import { passwordSchema } from "./registerSchema";

export const INITIAL_RESET_PASSWORD_FORM = {
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
};

export const RESET_PASSWORD_FIELDS = [
    {
        id: "oldPassword",
        name: "oldPassword",
        label: "Old Password *",
        type: "password",
        placeholder: "Enter your current/old password",
        required: true,
    },
    {
        id: "newPassword",
        name: "newPassword",
        label: "New Password *",
        type: "password",
        placeholder: "Enter your new password",
        required: true,
    },
    {
        id: "confirmPassword",
        name: "confirmPassword",
        label: "Confirm Password *",
        type: "password",
        placeholder: "Confirm your new password",
        required: true,
    },
];

const baseResetPasswordSchema = z.object({
    oldPassword: z.string().min(1, "Old password is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, AUTH_MESSAGES.CONFIRM_PASSWORD_REQUIRED),
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
        oldPassword: fieldErrors.oldPassword?.[0] || "",
        newPassword: fieldErrors.newPassword?.[0] || "",
        confirmPassword: fieldErrors.confirmPassword?.[0] || "",
    };
}
