import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "@/services/api";
import { userService } from "@/services/userService";

describe("userService", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("getUsers calls api.get with query parameters", async () => {
        const getSpy = vi.spyOn(api, "get").mockResolvedValue({
            data: [{ id: 1, name: "Alice", role: "student" }],
            meta: { total: 1 },
        });

        const res = await userService.getUsers({
            page: 1,
            limit: 10,
            role: "student",
            status: "active",
            search: "Alice",
        });

        expect(getSpy).toHaveBeenCalledWith("/users", {
            params: {
                page: 1,
                limit: 10,
                role: "student",
                status: "active",
                search: "Alice",
            },
        });
        expect(res.data).toHaveLength(1);
    });

    it("getActiveStudents calls api.get with /users/students", async () => {
        const getSpy = vi
            .spyOn(api, "get")
            .mockResolvedValue([
                { id: 2, name: "Bob", email: "bob@campus.com" },
            ]);

        const res = await userService.getActiveStudents();

        expect(getSpy).toHaveBeenCalledWith("/users/students");
        expect(res).toHaveLength(1);
        expect(res[0].name).toBe("Bob");
    });

    it("getActiveInstructors calls api.get with /users/instructors", async () => {
        const getSpy = vi
            .spyOn(api, "get")
            .mockResolvedValue([
                {
                    id: 4,
                    name: "Dr. Jane",
                    email: "jane@campus.com",
                    role: "instructor",
                },
            ]);

        const res = await userService.getActiveInstructors();

        expect(getSpy).toHaveBeenCalledWith("/users/instructors");
        expect(res).toHaveLength(1);
        expect(res[0].name).toBe("Dr. Jane");
        expect(res[0].email).toBe("jane@campus.com");
    });

    it("updateStatus sends PATCH request with new status", async () => {
        const patchSpy = vi.spyOn(api, "patch").mockResolvedValue({
            id: 3,
            status: "disabled",
        });

        const res = await userService.updateStatus(3, "disabled");

        expect(patchSpy).toHaveBeenCalledWith("/users/3/status", {
            status: "disabled",
        });
        expect(res.status).toBe("disabled");
    });
});
