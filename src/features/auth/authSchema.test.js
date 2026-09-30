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

    it("fails validation when password is shorter than 8 characters", () => {
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
            password: "SecurePass@123",
            confirmPassword: "SecurePass@123",
        });
        expect(result.success).toBe(true);
    });

    it("fails validation when passwords do not match", () => {
        const result = registerSchema.safeParse({
            name: "John Doe",
            email: "john@campus.com",
            password: "SecurePass@123",
            confirmPassword: "DifferentPass@456",
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
            password: "SecurePass@123",
            confirmPassword: "SecurePass@123",
        });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.flatten().fieldErrors.name).toBeDefined();
        }
    });

    it("fails validation when password is shorter than 8 characters", () => {
        const result = registerSchema.safeParse({
            name: "John Doe",
            email: "john@campus.com",
            password: "Pass@1",
            confirmPassword: "Pass@1",
        });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.flatten().fieldErrors.password).toBeDefined();
        }
    });

    it("fails validation when password lacks uppercase letter", () => {
        const result = registerSchema.safeParse({
            name: "John Doe",
            email: "john@campus.com",
            password: "securepass@123",
            confirmPassword: "securepass@123",
        });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.flatten().fieldErrors.password).toContain(
                "Password must contain at least one uppercase letter"
            );
        }
    });

    it("fails validation when password lacks lowercase letter", () => {
        const result = registerSchema.safeParse({
            name: "John Doe",
            email: "john@campus.com",
            password: "SECUREPASS@123",
            confirmPassword: "SECUREPASS@123",
        });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.flatten().fieldErrors.password).toContain(
                "Password must contain at least one lowercase letter"
            );
        }
    });

    it("fails validation when password lacks number", () => {
        const result = registerSchema.safeParse({
            name: "John Doe",
            email: "john@campus.com",
            password: "SecurePass@word",
            confirmPassword: "SecurePass@word",
        });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.flatten().fieldErrors.password).toContain(
                "Password must contain at least one number"
            );
        }
    });

    it("fails validation when password lacks special character", () => {
        const result = registerSchema.safeParse({
            name: "John Doe",
            email: "john@campus.com",
            password: "SecurePassword123",
            confirmPassword: "SecurePassword123",
        });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.flatten().fieldErrors.password).toContain(
                "Password must contain at least one special character (e.g. @, #, $)"
            );
        }
    });

    it("validates fields in real-time as user types", () => {
        expect(validateRegisterField("name", "J", {})).not.toBe("");
        expect(validateRegisterField("name", "Jane", {})).toBe("");
        expect(validateRegisterField("email", "bad-email", {})).not.toBe("");
        expect(validateRegisterField("email", "jane@campus.com", {})).toBe("");
        expect(validateRegisterField("password", "short", {})).not.toBe("");
        expect(validateRegisterField("password", "SecurePass@123", {})).toBe(
            ""
        );
        expect(
            validateRegisterField("confirmPassword", "mismatch", {
                password: "SecurePass@123",
            })
        ).not.toBe("");
        expect(
            validateRegisterField("confirmPassword", "SecurePass@123", {
                password: "SecurePass@123",
            })
        ).toBe("");
    });
});
