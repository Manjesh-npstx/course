/**
 * Centralized user-facing messages and validation errors.
 * Avoids magic strings and ensures consistent UX copy.
 */
export const AUTH_MESSAGES = Object.freeze({
    NAME_REQUIRED: "Name must be at least 2 characters",
    EMAIL_INVALID: "Please enter a valid email address",
    PASSWORD_MIN_LENGTH: "Password must be at least 6 characters",
    PASSWORDS_DO_NOT_MATCH: "Passwords do not match",
    GENERIC_LOGIN_ERROR: "Invalid username or password",
});
