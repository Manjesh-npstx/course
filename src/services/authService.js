import { API_ENDPOINTS } from "@/constants/api";
import { AUTH_MESSAGES } from "@/constants/messages";
import api from "@/services/api";
import { tokenStorage } from "@/services/tokenStorage";

/**
 * Authentication service handling login, registration, and role switching.
 */
export const authService = {
    async login(credentials) {
        try {
            const data = await api.post(API_ENDPOINTS.LOGIN, credentials);
            if (data.token) {
                tokenStorage.setToken(data.token);
            }
            if (data.user) {
                tokenStorage.setUser(data.user);
            }
            return data;
        } catch (err) {
            if (err.status === 401 || err.status === 400) {
                throw new Error(AUTH_MESSAGES.GENERIC_LOGIN_ERROR, {
                    cause: err,
                });
            }
            throw err;
        }
    },

    async register(userData) {
        try {
            const payload = {
                name: userData.name,
                email: userData.email,
                password: userData.password,
            };
            const data = await api.post(API_ENDPOINTS.REGISTER, payload);
            if (data.token) {
                tokenStorage.setToken(data.token);
            }
            if (data.user) {
                tokenStorage.setUser(data.user);
            }
            return data;
        } catch (err) {
            throw new Error(err.message || "Registration failed", {
                cause: err,
            });
        }
    },

    async switchRole(role) {
        const payload = role ? { role } : {};
        const data = await api.post(API_ENDPOINTS.SWITCH_ROLE, payload);
        if (data.token) {
            tokenStorage.setToken(data.token);
        }
        if (data.user) {
            tokenStorage.setUser(data.user);
        }
        return data;
    },

    logout() {
        tokenStorage.clear();
    },

    getCurrentUser() {
        return tokenStorage.getUser();
    },

    isAuthenticated() {
        return tokenStorage.hasToken();
    },
};

export default authService;
