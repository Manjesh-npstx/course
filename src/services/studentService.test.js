import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "@/services/api";
import { studentService } from "@/services/studentService";

describe("studentService", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("getStudents calls api.get with query parameters", async () => {
        const getSpy = vi.spyOn(api, "get").mockResolvedValue({
            data: [{ id: 1, name: "Alice" }],
            meta: { total: 1 },
        });

        const res = await studentService.getStudents({
            page: 1,
            limit: 10,
            search: "Alice",
        });

        expect(getSpy).toHaveBeenCalledWith("/students", {
            params: { page: 1, limit: 10, search: "Alice" },
        });
        expect(res.data).toHaveLength(1);
    });

    it("getStudentById calls api.get with /students/:id", async () => {
        const getSpy = vi
            .spyOn(api, "get")
            .mockResolvedValue({ id: 3, name: "Bob" });

        const res = await studentService.getStudentById(3);

        expect(getSpy).toHaveBeenCalledWith("/students/3");
        expect(res.name).toBe("Bob");
    });

    it("enrollStudent sends POST request with student details", async () => {
        const postSpy = vi
            .spyOn(api, "post")
            .mockResolvedValue({ id: 5, name: "Charlie" });

        const payload = {
            name: "Charlie",
            email: "charlie@campus.com",
            courseId: 2,
        };
        const res = await studentService.enrollStudent(payload);

        expect(postSpy).toHaveBeenCalledWith("/students", payload);
        expect(res.id).toBe(5);
    });

    it("updateStudent sends PATCH request to update student details", async () => {
        const patchSpy = vi
            .spyOn(api, "patch")
            .mockResolvedValue({ id: 5, name: "Charlie Updated" });

        const updateData = { name: "Charlie Updated" };
        const res = await studentService.updateStudent(5, updateData);

        expect(patchSpy).toHaveBeenCalledWith("/students/5", updateData);
        expect(res.name).toBe("Charlie Updated");
    });

    it("deleteStudent sends DELETE request to /students/:id", async () => {
        const deleteSpy = vi.spyOn(api, "delete").mockResolvedValue(undefined);

        await studentService.deleteStudent(8);

        expect(deleteSpy).toHaveBeenCalledWith("/students/8");
    });
});
