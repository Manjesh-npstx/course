import { ROLES } from "./roles";
import { ROUTES } from "./routes";

/**
 * Navigation items configuration for the application sidebar.
 * Driven from config to avoid hardcoded menu items in layout components.
 */
export const NAV_ITEMS = Object.freeze([
    {
        id: "courses",
        label: "Courses",
        path: ROUTES.COURSES,
        icon: "book",
        roles: [ROLES.ADMIN, ROLES.INSTRUCTOR, ROLES.STUDENT],
    },
    {
        id: "students",
        label: "Students",
        path: ROUTES.STUDENTS,
        icon: "users",
        roles: [ROLES.ADMIN, ROLES.INSTRUCTOR],
    },
]);
