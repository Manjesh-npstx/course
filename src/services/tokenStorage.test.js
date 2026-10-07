import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { tokenStorage } from "./tokenStorage";

const createStorageMock = () => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, val) => {
            store[key] = String(val);
        },
        removeItem: (key) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        },
    };
};

globalThis.localStorage = createStorageMock();

describe("tokenStorage", () => {
    beforeEach(() => {
        tokenStorage.clear();
    });

    afterEach(() => {
        tokenStorage.clear();
    });

    it("stores and retrieves auth token correctly", () => {
        expect(tokenStorage.getToken()).toBeNull();
        expect(tokenStorage.hasToken()).toBe(false);

        tokenStorage.setToken("sample-jwt-token");
        expect(tokenStorage.getToken()).toBe("sample-jwt-token");
        expect(tokenStorage.hasToken()).toBe(true);
    });

    it("stores and retrieves user object correctly", () => {
        const user = { id: 1, name: "Alice", email: "alice@example.com" };
        tokenStorage.setUser(user);

        expect(tokenStorage.getUser()).toEqual(user);
    });

    it("clears token, refresh token, and user on clear()", () => {
        tokenStorage.setToken("jwt-123");
        tokenStorage.setRefreshToken("refresh-456");
        tokenStorage.setUser({ id: 2, name: "Bob" });

        expect(tokenStorage.getRefreshToken()).toBe("refresh-456");

        tokenStorage.clear();
        expect(tokenStorage.getToken()).toBeNull();
        expect(tokenStorage.getRefreshToken()).toBeNull();
        expect(tokenStorage.getUser()).toBeNull();
        expect(tokenStorage.hasToken()).toBe(false);
    });
});
