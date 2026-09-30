import { API_ENDPOINTS } from "@/constants/api";
import api from "@/services/api";

/**
 * Service handling student and enrollment API requests.
 */
export const studentService = {
    /**
     * List all enrolled students with pagination and search.
     *
     * @param {Object} [params]
     * @param {number} [params.page=1]
     * @param {number} [params.limit=10]
     * @param {string} [params.search='']
     * @returns {Promise<{ data: Array, meta: Object }>}
     */
    async getStudents({ page = 1, limit = 10, search = "" } = {}) {
        const params = { page, limit };
        if (search) params.search = search;
        return api.get(API_ENDPOINTS.STUDENTS, { params });
    },

    /**
     * Get single student by ID.
     *
     * @param {number|string} id
     * @returns {Promise<Object>}
     */
    async getStudentById(id) {
        return api.get(API_ENDPOINTS.STUDENT_DETAIL(id));
    },

    /**
     * Enroll a student in a course (Admin or Student).
     *
     * @param {Object} data
     * @param {string} data.name
     * @param {string} data.email
     * @param {number} data.courseId
     * @returns {Promise<Object>}
     */
    async enrollStudent(data) {
        return api.post(API_ENDPOINTS.STUDENTS, data);
    },

    /**
     * Update an enrolled student's details.
     *
     * @param {number|string} id
     * @param {Object} data
     * @returns {Promise<Object>}
     */
    async updateStudent(id, data) {
        return api.patch(API_ENDPOINTS.STUDENT_DETAIL(id), data);
    },

    /**
     * Unenroll/remove a student from a course (Admin only).
     *
     * @param {number|string} id
     * @returns {Promise<void>}
     */
    async deleteStudent(id) {
        return api.delete(API_ENDPOINTS.STUDENT_DETAIL(id));
    },
};

export default studentService;
