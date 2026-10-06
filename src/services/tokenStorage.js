import { STORAGE_KEYS } from "@/constants/storage";

/**
 * Manages storage access for authentication tokens and user session data.
 */
export const tokenStorage = {
    getToken() {
        return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    },
    setToken(token) {
        if (token) {
            localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        }
    },
    getUser() {
        const raw = localStorage.getItem(STORAGE_KEYS.USER_DATA);
        try {
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    },
    setUser(user) {
        if (user) {
            localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
        }
    },
    clear() {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
    },
    hasToken() {
        return Boolean(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN));
    },
};
