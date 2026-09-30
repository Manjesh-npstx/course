import { ROLES } from "@/constants/roles";

/**
 * Pure authorization helper functions for role-based UI rendering.
 * Note: These provide UX gating only; the backend API enforces all security rules.
 */

/**
 * Check if the user has any of the allowed roles.
 *
 * @param {Object|null} user
 * @param {string[]} allowedRoles
 * @returns {boolean}
 */
export function hasRole(user, allowedRoles) {
    if (!user || !user.role) return false;
    const normalizedRole = user.role.toLowerCase();
    return allowedRoles.some((role) => role.toLowerCase() === normalizedRole);
}

/**
 * Check if the user is an administrator.
 *
 * @param {Object|null} user
 * @returns {boolean}
 */
export function isAdmin(user) {
    return hasRole(user, [ROLES.ADMIN]);
}

/**
 * Check if the user is an instructor.
 *
 * @param {Object|null} user
 * @returns {boolean}
 */
export function isInstructor(user) {
    return hasRole(user, [ROLES.INSTRUCTOR]);
}

/**
 * Check if the user is a student.
 *
 * @param {Object|null} user
 * @returns {boolean}
 */
export function isStudent(user) {
    return (
        hasRole(user, [ROLES.STUDENT]) ||
        (Boolean(user) && !isAdmin(user) && !isInstructor(user))
    );
}

/**
 * Check if the user can create new courses (Admin or Instructor).
 *
 * @param {Object|null} user
 * @returns {boolean}
 */
export function canCreateCourse(user) {
    return hasRole(user, [ROLES.ADMIN, ROLES.INSTRUCTOR]);
}

/**
 * Check if the user can approve or reject courses (Admin only).
 *
 * @param {Object|null} user
 * @returns {boolean}
 */
export function canApproveCourse(user) {
    return isAdmin(user);
}

/**
 * Check if the user can delete courses (Admin only).
 *
 * @param {Object|null} user
 * @returns {boolean}
 */
export function canDeleteCourse(user) {
    return isAdmin(user);
}

/**
 * Check if the user can enroll in courses (Student or Admin).
 *
 * @param {Object|null} user
 * @returns {boolean}
 */
export function canEnroll(user) {
    return isStudent(user) || isAdmin(user);
}
