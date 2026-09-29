/**
 * API configuration and route endpoints.
 */
export const API_CONFIG = Object.freeze({
    BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3000",
});

export const API_ENDPOINTS = Object.freeze({
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
});
