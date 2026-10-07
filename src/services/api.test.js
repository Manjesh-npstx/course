import { beforeEach, describe, expect, it, vi } from "vitest";
import api, { setOnAuthError } from "@/services/api";
import { tokenStorage } from "@/services/tokenStorage";

describe("api client interceptors", () => {
    beforeEach(() => {
        tokenStorage.clear();
        setOnAuthError(null);
        vi.restoreAllMocks();
    });

    it("attaches Authorization header when token is stored", async () => {
        tokenStorage.setToken("mock-jwt-token");
        const requestInterceptor = api.interceptors.request.handlers[0];

        const config = { headers: {} };
        const result = await requestInterceptor.fulfilled(config);

        expect(result.headers.Authorization).toBe("Bearer mock-jwt-token");
    });

    it("does not attach Authorization header when token is absent", async () => {
        const requestInterceptor = api.interceptors.request.handlers[0];

        const config = { headers: {} };
        const result = await requestInterceptor.fulfilled(config);

        expect(result.headers.Authorization).toBeUndefined();
    });

    it("unwraps response data on successful response", () => {
        const responseInterceptor = api.interceptors.response.handlers[0];
        const mockResponse = { data: { success: true, count: 5 } };

        const unwrapped = responseInterceptor.fulfilled(mockResponse);
        expect(unwrapped).toEqual({ success: true, count: 5 });
    });

    it("clears token and triggers onAuthError callback on 401 response", async () => {
        tokenStorage.setToken("expired-token");
        const authErrorSpy = vi.fn();
        setOnAuthError(authErrorSpy);

        const responseInterceptor = api.interceptors.response.handlers[0];
        const error401 = {
            response: {
                status: 401,
                data: { message: "Unauthorized token expired" },
            },
        };

        await expect(responseInterceptor.rejected(error401)).rejects.toThrow(
            "Unauthorized token expired"
        );

        expect(tokenStorage.getToken()).toBeNull();
        expect(authErrorSpy).toHaveBeenCalledOnce();
    });

    it("normalizes array error messages cleanly into single string", async () => {
        const responseInterceptor = api.interceptors.response.handlers[0];
        const validationError = {
            response: {
                status: 400,
                data: {
                    message: [
                        "seatLimit must not be empty",
                        "name is required",
                    ],
                },
            },
        };

        await expect(
            responseInterceptor.rejected(validationError)
        ).rejects.toThrow("seatLimit must not be empty, name is required");
    });

    it("silently refreshes token on 401 when refresh token is available", async () => {
        tokenStorage.setToken("expired-access");
        tokenStorage.setRefreshToken("valid-refresh");

        const axios = (await import("axios")).default;
        const postSpy = vi.spyOn(axios, "post").mockResolvedValue({
            data: {
                token: "new-access-token",
                refreshToken: "new-refresh-token",
                user: { id: 1, name: "Alice" },
            },
        });

        const originalRequest = {
            url: "/courses",
            headers: {},
        };

        const error401 = {
            config: originalRequest,
            response: {
                status: 401,
                data: { message: "Unauthorized" },
            },
        };

        const responseInterceptor = api.interceptors.response.handlers[0];

        await responseInterceptor.rejected(error401);

        expect(postSpy).toHaveBeenCalled();
        expect(tokenStorage.getToken()).toBe("new-access-token");
        expect(tokenStorage.getRefreshToken()).toBe("new-refresh-token");
    });
});
