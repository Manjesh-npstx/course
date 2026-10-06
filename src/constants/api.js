import { ENV } from "@/config/env";

/**
 * API configuration and route endpoints.
 */
export const API_CONFIG = Object.freeze({
    BASE_URL: ENV.API_URL,
});

export const API_ENDPOINTS = Object.freeze({
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    SWITCH_ROLE: "/auth/switch-role",
    COURSES: "/courses",
    MY_COURSES: "/courses/my-courses",
    ENROLL: (id) => `/courses/${id}/enroll`,
    APPROVE_COURSE: (id) => `/courses/${id}/approve`,
    REJECT_COURSE: (id) => `/courses/${id}/reject`,
    COURSE_DETAIL: (id) => `/courses/${id}`,
    COURSE_STUDENTS: (id) => `/courses/${id}/students`,
    STUDENTS: "/students",
    STUDENT_DETAIL: (id) => `/students/${id}`,
    USERS: "/users",
    ACTIVE_STUDENTS: "/users/students",
    USER_STATUS: (id) => `/users/${id}/status`,
});
