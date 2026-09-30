/**
 * Centralized user-facing messages and validation errors.
 * Avoids magic strings and ensures consistent UX copy.
 */
export const AUTH_MESSAGES = Object.freeze({
    NAME_REQUIRED: "Name must be at least 2 characters",
    EMAIL_INVALID: "Please enter a valid email address",
    PASSWORD_MIN_LENGTH: "Password must be at least 8 characters",
    PASSWORD_UPPERCASE: "Password must contain at least one uppercase letter",
    PASSWORD_LOWERCASE: "Password must contain at least one lowercase letter",
    PASSWORD_NUMBER: "Password must contain at least one number",
    PASSWORD_SPECIAL:
        "Password must contain at least one special character (e.g. @, #, $)",
    CONFIRM_PASSWORD_REQUIRED: "Please confirm your password",
    PASSWORDS_DO_NOT_MATCH: "Passwords do not match",
    GENERIC_LOGIN_ERROR: "Invalid username or password",
    REGISTRATION_SUCCESS: "Account created successfully. Please log in.",
    SESSION_EXPIRED: "Your session has expired. Please log in again.",
    UNAUTHORIZED: "You are not authorized to perform this action.",
});

export const COURSE_MESSAGES = Object.freeze({
    FETCH_ERROR: "Failed to load courses. Please try again.",
    CREATE_SUCCESS: "Course created successfully.",
    SUBMIT_FOR_REVIEW: "Course submitted for Admin review (Status: PENDING).",
    ENROLL_SUCCESS: "Successfully enrolled in course!",
    APPROVE_SUCCESS: "Course approved successfully.",
    REJECT_SUCCESS: "Course rejected.",
    DELETE_SUCCESS: "Course deleted successfully.",
});
