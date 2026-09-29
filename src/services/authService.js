import { API_CONFIG, API_ENDPOINTS } from "@/constants/api";
import { AUTH_MESSAGES } from "@/constants/messages";
import { tokenStorage } from "@/services/tokenStorage";

/**
 * Authentication service handling login and registration API requests.
 */
export const authService = {
    async login(credentials) {
        const response = await fetch(
            `${API_CONFIG.BASE_URL}${API_ENDPOINTS.LOGIN}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(credentials),
            }
        );

        if (!response.ok) {
            // Enforce generic message to avoid username enumeration
            throw new Error(AUTH_MESSAGES.GENERIC_LOGIN_ERROR);
        }

        const data = await response.json();
        if (data.token) {
            tokenStorage.setToken(data.token);
        }
        if (data.user) {
            tokenStorage.setUser(data.user);
        }
        return data;
    },

    async register(userData) {
        const response = await fetch(
            `${API_CONFIG.BASE_URL}${API_ENDPOINTS.REGISTER}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: userData.name,
                    email: userData.email,
                    password: userData.password,
                }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const message =
                errorData.message ||
                (Array.isArray(errorData.errors)
                    ? errorData.errors[0]
                    : null) ||
                "Registration failed";
            throw new Error(message);
        }

        const data = await response.json();
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
};
