import { describe, expect, it } from "vitest";
import { ROLES } from "@/constants/roles";
import {
    canApproveCourse,
    canCreateCourse,
    canDeleteCourse,
    canEnroll,
    hasRole,
    isAdmin,
    isInstructor,
    isStudent,
} from "@/utils/permissions";

describe("permissions utility", () => {
    const adminUser = { role: ROLES.ADMIN, email: "admin@campus.com" };
    const instructorUser = {
        role: ROLES.INSTRUCTOR,
        email: "instructor@campus.com",
    };
    const studentUser = { role: ROLES.STUDENT, email: "student@campus.com" };

    it("hasRole matches case-insensitively and returns false for null", () => {
        expect(hasRole(null, [ROLES.ADMIN])).toBe(false);
        expect(hasRole({ role: "ADMIN" }, [ROLES.ADMIN])).toBe(true);
        expect(hasRole(adminUser, [ROLES.ADMIN])).toBe(true);
        expect(hasRole(studentUser, [ROLES.ADMIN])).toBe(false);
    });

    it("isAdmin accurately identifies admin users", () => {
        expect(isAdmin(adminUser)).toBe(true);
        expect(isAdmin(instructorUser)).toBe(false);
        expect(isAdmin(studentUser)).toBe(false);
        expect(isAdmin(null)).toBe(false);
    });

    it("isInstructor accurately identifies instructor users", () => {
        expect(isInstructor(instructorUser)).toBe(true);
        expect(isInstructor(adminUser)).toBe(false);
        expect(isInstructor(studentUser)).toBe(false);
    });

    it("isStudent identifies student users or defaults non-admin/non-instructors", () => {
        expect(isStudent(studentUser)).toBe(true);
        expect(isStudent({ role: "custom" })).toBe(true);
        expect(isStudent(adminUser)).toBe(false);
        expect(isStudent(instructorUser)).toBe(false);
        expect(isStudent(null)).toBe(false);
    });

    it("canCreateCourse permits admins and instructors", () => {
        expect(canCreateCourse(adminUser)).toBe(true);
        expect(canCreateCourse(instructorUser)).toBe(true);
        expect(canCreateCourse(studentUser)).toBe(false);
    });

    it("canApproveCourse and canDeleteCourse permit admin only", () => {
        expect(canApproveCourse(adminUser)).toBe(true);
        expect(canApproveCourse(instructorUser)).toBe(false);
        expect(canApproveCourse(studentUser)).toBe(false);

        expect(canDeleteCourse(adminUser)).toBe(true);
        expect(canDeleteCourse(instructorUser)).toBe(false);
    });

    it("canEnroll permits student and admin", () => {
        expect(canEnroll(studentUser)).toBe(true);
        expect(canEnroll(adminUser)).toBe(true);
        expect(canEnroll(instructorUser)).toBe(false);
    });
});
