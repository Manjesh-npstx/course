import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "@/services/api";
import { courseService } from "@/services/courseService";

describe("courseService", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("getCourses calls api.get with correct endpoint and query params", async () => {
        const getSpy = vi.spyOn(api, "get").mockResolvedValue({
            data: [{ id: 1, name: "Algorithms" }],
            meta: { total: 1 },
        });

        const result = await courseService.getCourses({
            page: 2,
            limit: 5,
            search: "Algo",
            status: "approved",
        });

        expect(getSpy).toHaveBeenCalledWith("/courses", {
            params: { page: 2, limit: 5, search: "Algo", status: "approved" },
        });
        expect(result.data).toHaveLength(1);
    });

    it("getMyCourses calls api.get with /courses/my-courses", async () => {
        const getSpy = vi.spyOn(api, "get").mockResolvedValue({ data: [] });

        await courseService.getMyCourses({ page: 1, limit: 10 });

        expect(getSpy).toHaveBeenCalledWith("/courses/my-courses", {
            params: { page: 1, limit: 10 },
        });
    });

    it("createCourse sends POST request to /courses with payload", async () => {
        const newCourse = {
            name: "Cloud Architecture",
            instructor: "Dr. Cloud",
            seatLimit: 40,
        };
        const postSpy = vi.spyOn(api, "post").mockResolvedValue({
            id: 2,
            ...newCourse,
            status: "pending",
        });

        const res = await courseService.createCourse(newCourse);

        expect(postSpy).toHaveBeenCalledWith("/courses", newCourse);
        expect(res.id).toBe(2);
    });

    it("createCourse sends POST request with instructorEmail", async () => {
        const newCourse = {
            name: "Cyber Security",
            instructor: "Dr. Jane Instructor",
            instructorEmail: "instructor1@campus.com",
            seatLimit: 25,
        };
        const postSpy = vi.spyOn(api, "post").mockResolvedValue({
            id: 3,
            ...newCourse,
            status: "approved",
        });

        const res = await courseService.createCourse(newCourse);

        expect(postSpy).toHaveBeenCalledWith("/courses", newCourse);
        expect(res.instructorEmail).toBe("instructor1@campus.com");
    });

    it("enroll sends POST request to course enroll endpoint with optional name", async () => {
        const postSpy = vi.spyOn(api, "post").mockResolvedValue({ id: 1 });

        await courseService.enroll(10, "Student Name");

        expect(postSpy).toHaveBeenCalledWith("/courses/10/enroll", {
            name: "Student Name",
        });
    });

    it("approveCourse sends PATCH request to /courses/:id/approve", async () => {
        const patchSpy = vi.spyOn(api, "patch").mockResolvedValue({
            id: 5,
            status: "approved",
        });

        const res = await courseService.approveCourse(5);

        expect(patchSpy).toHaveBeenCalledWith("/courses/5/approve");
        expect(res.status).toBe("approved");
    });
});
