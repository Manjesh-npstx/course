/**
 * Application route paths.
 * Centralized to avoid hardcoded string routes across components.
 */
export const ROUTES = Object.freeze({
    HOME: "/",
    COURSES: "/courses",
    COURSE_DETAIL: (id) => `/courses/${id}`,
    STUDENTS: "/students",
    LOGIN: "/login",
    REGISTER: "/register",
    RESET_PASSWORD: "/reset-password",
    PROFILE: "/profile",
});
