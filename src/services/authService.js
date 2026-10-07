import axios from "axios";
import { API_CONFIG, API_ENDPOINTS } from "@/constants/api";
import { AUTH_MESSAGES } from "@/constants/messages";
import api from "@/services/api";
import { tokenStorage } from "@/services/tokenStorage";

/**
 * Authentication service handling login, registration, token refresh, and logout.
 */
export const authService = {
    async login(credentials) {
        try {
            const data = await api.post(API_ENDPOINTS.LOGIN, credentials);
            if (data.token) {
                tokenStorage.setToken(data.token);
            }
            if (data.refreshToken) {
                tokenStorage.setRefreshToken(data.refreshToken);
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
            if (data.refreshToken) {
                tokenStorage.setRefreshToken(data.refreshToken);
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
        if (data.refreshToken) {
            tokenStorage.setRefreshToken(data.refreshToken);
        }
        if (data.user) {
            tokenStorage.setUser(data.user);
        }
        return data;
    },

    async refreshToken() {
        const currentRefreshToken = tokenStorage.getRefreshToken();
        if (!currentRefreshToken) {
            throw new Error("No refresh token available");
        }
        const response = await axios.post(
            `${API_CONFIG.BASE_URL}${API_ENDPOINTS.REFRESH}`,
            { refreshToken: currentRefreshToken },
            { headers: { "Content-Type": "application/json" } }
        );
        const data = response.data;
        if (data.token) {
            tokenStorage.setToken(data.token);
        }
        if (data.refreshToken) {
            tokenStorage.setRefreshToken(data.refreshToken);
        }
        if (data.user) {
            tokenStorage.setUser(data.user);
        }
        return data;
    },

    async logout() {
        const currentRefreshToken = tokenStorage.getRefreshToken();
        if (currentRefreshToken) {
            try {
                await axios.post(
                    `${API_CONFIG.BASE_URL}${API_ENDPOINTS.LOGOUT}`,
                    { refreshToken: currentRefreshToken },
                    { headers: { "Content-Type": "application/json" } }
                );
            } catch {
                // Ignore errors during logout request
            }
        }
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
