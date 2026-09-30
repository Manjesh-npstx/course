import axios from "axios";
import { API_CONFIG } from "@/constants/api";
import { tokenStorage } from "@/services/tokenStorage";

let onAuthErrorCallback = null;

/**
 * Register a callback to be invoked when a 401 Unauthorized response is encountered.
 *
 * @param {Function|null} callback
 */
export function setOnAuthError(callback) {
    onAuthErrorCallback = callback;
}

/**
 * Shared Axios client configured with interceptors for auth tokens and error handling.
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

// Response interceptor: unwrap data, handle 401 Unauthorized, and normalize errors
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const status = error.response?.status;
        if (status === 401) {
            tokenStorage.clear();
            if (typeof onAuthErrorCallback === "function") {
                onAuthErrorCallback();
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
