import { describe, expect, it } from "vitest";
import { loginSchema, validateLoginField } from "./loginSchema";
import { registerSchema, validateRegisterField } from "./registerSchema";

describe("loginSchema", () => {
    it("passes validation with valid email and password", () => {
        const result = loginSchema.safeParse({
            email: "student@campus.com",
            password: "password123",
        });
        expect(result.success).toBe(true);
    });

    it("fails validation when email is invalid", () => {
        const result = loginSchema.safeParse({
            email: "not-an-email",
            password: "password123",
        });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.flatten().fieldErrors.email).toBeDefined();
        }
    });

    it("fails validation when password is shorter than 6 characters", () => {
        const result = loginSchema.safeParse({
            email: "student@campus.com",
            password: "123",
        });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.flatten().fieldErrors.password).toBeDefined();
        }
    });

    it("validates fields in real-time as user types", () => {
        expect(validateLoginField("email", "invalid")).not.toBe("");
        expect(validateLoginField("email", "valid@campus.com")).toBe("");
        expect(validateLoginField("password", "123")).not.toBe("");
        expect(validateLoginField("password", "secure123")).toBe("");
    });
});

describe("registerSchema", () => {
    it("passes validation with valid registration data", () => {
        const result = registerSchema.safeParse({
            name: "John Doe",
            email: "john@campus.com",
            password: "securePassword1",
            confirmPassword: "securePassword1",
        });
        expect(result.success).toBe(true);
    });

    it("fails validation when passwords do not match", () => {
        const result = registerSchema.safeParse({
            name: "John Doe",
            email: "john@campus.com",
            password: "securePassword1",
            confirmPassword: "differentPassword2",
        });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(
                result.error.flatten().fieldErrors.confirmPassword
            ).toBeDefined();
        }
    });

    it("fails validation when name is shorter than 2 characters", () => {
        const result = registerSchema.safeParse({
            name: "J",
            email: "john@campus.com",
            password: "securePassword1",
            confirmPassword: "securePassword1",
        });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.flatten().fieldErrors.name).toBeDefined();
        }
    });

    it("validates fields in real-time as user types", () => {
        expect(validateRegisterField("name", "J", {})).not.toBe("");
        expect(validateRegisterField("name", "Jane", {})).toBe("");
        expect(validateRegisterField("email", "bad-email", {})).not.toBe("");
        expect(validateRegisterField("email", "jane@campus.com", {})).toBe("");
        expect(
            validateRegisterField("confirmPassword", "mismatch", {
                password: "correct123",
            })
        ).not.toBe("");
        expect(
            validateRegisterField("confirmPassword", "correct123", {
                password: "correct123",
            })
        ).toBe("");
    });
});
