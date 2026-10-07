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

    it("login successfully saves token, refreshToken, and user to tokenStorage", async () => {
        const mockUser = {
            id: 1,
            name: "John",
            email: "john@campus.com",
            role: "student",
        };
        vi.spyOn(api, "post").mockResolvedValue({
            user: mockUser,
            token: "jwt-token-123",
            refreshToken: "jwt-refresh-123",
        });

        const res = await authService.login({
            email: "john@campus.com",
            password: "Password1!",
        });

        expect(res.user).toEqual(mockUser);
        expect(tokenStorage.getToken()).toBe("jwt-token-123");
        expect(tokenStorage.getRefreshToken()).toBe("jwt-refresh-123");
        expect(tokenStorage.getUser()).toEqual(mockUser);
    });

    it("refreshToken exchanges stored refresh token for new tokens", async () => {
        tokenStorage.setRefreshToken("current-refresh-token");
        const mockUser = { id: 1, name: "John", email: "john@campus.com" };

        const axios = (await import("axios")).default;
        vi.spyOn(axios, "post").mockResolvedValue({
            data: {
                token: "new-access-token",
                refreshToken: "new-refresh-token",
                user: mockUser,
            },
        });

        const res = await authService.refreshToken();

        expect(res.token).toBe("new-access-token");
        expect(tokenStorage.getToken()).toBe("new-access-token");
        expect(tokenStorage.getRefreshToken()).toBe("new-refresh-token");
    });

    it("refreshToken throws error when no refresh token stored", async () => {
        await expect(authService.refreshToken()).rejects.toThrow(
            "No refresh token available"
        );
    });

    it("logout clears stored token, refresh token, and user data", async () => {
        tokenStorage.setToken("token-to-clear");
        tokenStorage.setRefreshToken("refresh-to-clear");
        tokenStorage.setUser({ id: 1, name: "Test" });

        await authService.logout();

        expect(authService.isAuthenticated()).toBe(false);
        expect(authService.getCurrentUser()).toBeNull();
        expect(tokenStorage.getRefreshToken()).toBeNull();
    });
});
