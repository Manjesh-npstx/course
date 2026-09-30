import { describe, expect, it } from "vitest";
import { PASSWORD_RULES } from "./registerSchema";

describe("PASSWORD_RULES", () => {
    const checkRule = (id, pwd) => {
        const rule = PASSWORD_RULES.find((r) => r.id === id);
        return rule ? rule.check(pwd) : false;
    };

    it("validates minimum 8 characters length", () => {
        expect(checkRule("length", "Pass1@")).toBe(false);
        expect(checkRule("length", "Pass@123")).toBe(true);
    });

    it("validates uppercase letter", () => {
        expect(checkRule("uppercase", "password123@")).toBe(false);
        expect(checkRule("uppercase", "Password123@")).toBe(true);
    });

    it("validates lowercase letter", () => {
        expect(checkRule("lowercase", "PASSWORD123@")).toBe(false);
        expect(checkRule("lowercase", "Password123@")).toBe(true);
    });

    it("validates number", () => {
        expect(checkRule("number", "Password@word")).toBe(false);
        expect(checkRule("number", "Password123@")).toBe(true);
    });

    it("validates special character", () => {
        expect(checkRule("special", "Password1234")).toBe(false);
        expect(checkRule("special", "Password123@")).toBe(true);
        expect(checkRule("special", "Password123#")).toBe(true);
        expect(checkRule("special", "Password123$")).toBe(true);
        expect(checkRule("special", "Password123!")).toBe(true);
    });

    it("all rules pass for a fully compliant password", () => {
        const compliantPassword = "SecurePassword1@";
        const allPass = PASSWORD_RULES.every((r) => r.check(compliantPassword));
        expect(allPass).toBe(true);
    });
});
