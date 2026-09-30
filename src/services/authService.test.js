import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "@/services/api";
import { authService } from "@/services/authService";
import { tokenStorage } from "@/services/tokenStorage";

describe("authService", () => {
    beforeEach(() => {
        tokenStorage.clear();
        vi.restoreAllMocks();
    });

    it("login successfully saves token and user to tokenStorage", async () => {
        const mockUser = {
            id: 1,
            name: "John",
            email: "john@campus.com",
            role: "student",
        };
        vi.spyOn(api, "post").mockResolvedValue({
            user: mockUser,
            token: "jwt-token-123",
        });

        const res = await authService.login({
            email: "john@campus.com",
            password: "Password1!",
        });

        expect(res.user).toEqual(mockUser);
        expect(tokenStorage.getToken()).toBe("jwt-token-123");
        expect(tokenStorage.getUser()).toEqual(mockUser);
    });

    it("login handles 401 error with generic login message", async () => {
        const err401 = new Error("Unauthorized");
        err401.status = 401;
        vi.spyOn(api, "post").mockRejectedValue(err401);

        await expect(
            authService.login({
                email: "wrong@campus.com",
                password: "wrong",
            })
        ).rejects.toThrow("Invalid username or password");
    });

    it("register successfully stores returned token and user", async () => {
        const mockUser = {
            id: 2,
            name: "Alice",
            email: "alice@campus.com",
            role: "student",
        };
        vi.spyOn(api, "post").mockResolvedValue({
            user: mockUser,
            token: "jwt-alice-token",
        });

        await authService.register({
            name: "Alice",
            email: "alice@campus.com",
            password: "Password1!",
        });

        expect(tokenStorage.getToken()).toBe("jwt-alice-token");
        expect(tokenStorage.getUser()).toEqual(mockUser);
    });

    it("switchRole updates stored session with new token and user", async () => {
        const adminUser = {
            id: 1,
            name: "Alice",
            email: "alice@campus.com",
            role: "admin",
        };
        vi.spyOn(api, "post").mockResolvedValue({
            user: adminUser,
            token: "jwt-admin-token",
        });

        await authService.switchRole("admin");

        expect(tokenStorage.getToken()).toBe("jwt-admin-token");
        expect(tokenStorage.getUser()?.role).toBe("admin");
    });

    it("logout clears stored token and user data", () => {
        tokenStorage.setToken("token-to-clear");
        tokenStorage.setUser({ id: 1, name: "Test" });

        authService.logout();

        expect(authService.isAuthenticated()).toBe(false);
        expect(authService.getCurrentUser()).toBeNull();
    });
});
