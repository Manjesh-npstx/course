import axios from "axios";
import { API_CONFIG, API_ENDPOINTS } from "@/constants/api";
import { tokenStorage } from "@/services/tokenStorage";

let onAuthErrorCallback = null;

/**
 * Register a callback to be invoked when a 401 Unauthorized response is encountered
 * and cannot be refreshed.
 *
 * @param {Function|null} callback
 */
export function setOnAuthError(callback) {
    onAuthErrorCallback = callback;
}

/**
 * Shared Axios client configured with interceptors for auth tokens, silent refresh, and error normalization.
 */
export const api = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor: automatically attach JWT Bearer token if user is logged in
api.interceptors.request.use(
    (config) => {
        const token = tokenStorage.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Response interceptor: unwrap data, handle 401 with silent token refresh, and normalize errors
api.interceptors.response.use(
    (response) => response.data,
    async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;

        const isAuthRoute =
            originalRequest?.url?.includes(API_ENDPOINTS.LOGIN) ||
            originalRequest?.url?.includes(API_ENDPOINTS.REGISTER) ||
            originalRequest?.url?.includes(API_ENDPOINTS.REFRESH);

        if (status === 401 && !originalRequest?._retry && !isAuthRoute) {
            const refreshToken = tokenStorage.getRefreshToken();
            if (refreshToken) {
                if (isRefreshing) {
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    })
                        .then((newToken) => {
                            originalRequest.headers.Authorization = `Bearer ${newToken}`;
                            return api(originalRequest);
                        })
                        .catch((err) => Promise.reject(err));
                }

                originalRequest._retry = true;
                isRefreshing = true;

                try {
                    const response = await axios.post(
                        `${API_CONFIG.BASE_URL}${API_ENDPOINTS.REFRESH}`,
                        { refreshToken },
                        { headers: { "Content-Type": "application/json" } }
                    );
                    const {
                        token,
                        refreshToken: newRefreshToken,
                        user,
                    } = response.data;
                    if (token) tokenStorage.setToken(token);
                    if (newRefreshToken)
                        tokenStorage.setRefreshToken(newRefreshToken);
                    if (user) tokenStorage.setUser(user);

                    processQueue(null, token);
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                } catch (refreshErr) {
                    processQueue(refreshErr, null);
                    tokenStorage.clear();
                    if (typeof onAuthErrorCallback === "function") {
                        onAuthErrorCallback();
                    }
                    const rawMessage =
                        refreshErr.response?.data?.message ||
                        refreshErr.message;
                    const normalized = new Error(
                        rawMessage || "Session expired"
                    );
                    normalized.status = 401;
                    return Promise.reject(normalized);
                } finally {
                    isRefreshing = false;
                }
            } else {
                tokenStorage.clear();
                if (typeof onAuthErrorCallback === "function") {
                    onAuthErrorCallback();
                }
            }
        }

        const rawMessage = error.response?.data?.message || error.message;
        const message = Array.isArray(rawMessage)
            ? rawMessage.join(", ")
            : rawMessage || "An unexpected error occurred";

        const normalizedError = new Error(message);
        normalizedError.status = status;
        normalizedError.data = error.response?.data;
        return Promise.reject(normalizedError);
    }
);

export default api;
