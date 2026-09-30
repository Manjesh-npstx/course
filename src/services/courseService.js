import { API_ENDPOINTS } from "@/constants/api";
import api from "@/services/api";

/**
 * Service handling all course API requests.
 */
export const courseService = {
    /**
     * Fetch paginated list of courses with optional search and status filter.
     *
     * @param {Object} [params]
     * @param {number} [params.page=1]
     * @param {number} [params.limit=10]
     * @param {string} [params.search='']
     * @param {string} [params.status='']
     * @returns {Promise<{ data: Array, meta: Object }>}
     */
    async getCourses({ page = 1, limit = 10, search = "", status = "" } = {}) {
        const params = { page, limit };
        if (search) params.search = search;
        if (status) params.status = status;
        return api.get(API_ENDPOINTS.COURSES, { params });
    },

    /**
     * Fetch courses associated with the current user.
     *
     * @param {Object} [params]
     * @param {number} [params.page=1]
     * @param {number} [params.limit=10]
     * @returns {Promise<{ data: Array, meta: Object }>}
     */
    async getMyCourses({ page = 1, limit = 10 } = {}) {
        return api.get(API_ENDPOINTS.MY_COURSES, { params: { page, limit } });
    },

    /**
     * Fetch single course details by ID.
     *
     * @param {number|string} id
     * @returns {Promise<Object>}
     */
    async getCourseById(id) {
        return api.get(API_ENDPOINTS.COURSE_DETAIL(id));
    },

    /**
     * Fetch students enrolled in a course.
     *
     * @param {number|string} courseId
     * @param {Object} [params]
     * @param {number} [params.page=1]
     * @param {number} [params.limit=10]
     * @returns {Promise<{ data: Array, meta: Object }>}
     */
    async getCourseStudents(courseId, { page = 1, limit = 10 } = {}) {
        return api.get(API_ENDPOINTS.COURSE_STUDENTS(courseId), {
            params: { page, limit },
        });
    },

    /**
     * Create a new course.
     *
     * @param {Object} data
     * @param {string} data.name
     * @param {string} data.instructor
     * @param {number} data.seatLimit
     * @returns {Promise<Object>}
     */
    async createCourse(data) {
        return api.post(API_ENDPOINTS.COURSES, data);
    },

    /**
     * Update an existing course.
     *
     * @param {number|string} id
     * @param {Object} data
     * @returns {Promise<Object>}
     */
    async updateCourse(id, data) {
        return api.patch(API_ENDPOINTS.COURSE_DETAIL(id), data);
    },

    /**
     * Enroll current authenticated student into a course.
     *
     * @param {number|string} courseId
     * @param {string} [name]
     * @returns {Promise<Object>}
     */
    async enroll(courseId, name) {
        const payload = name ? { name } : {};
        return api.post(API_ENDPOINTS.ENROLL(courseId), payload);
    },

    /**
     * Approve a pending course (Admin only).
     *
     * @param {number|string} courseId
     * @returns {Promise<Object>}
     */
    async approveCourse(courseId) {
        return api.patch(API_ENDPOINTS.APPROVE_COURSE(courseId));
    },

    /**
     * Reject a pending course (Admin only).
     *
     * @param {number|string} courseId
     * @returns {Promise<Object>}
     */
    async rejectCourse(courseId) {
        return api.patch(API_ENDPOINTS.REJECT_COURSE(courseId));
    },

    /**
     * Delete a course (Admin only).
     *
     * @param {number|string} courseId
     * @returns {Promise<void>}
     */
    async deleteCourse(courseId) {
        return api.delete(API_ENDPOINTS.COURSE_DETAIL(courseId));
    },
};

export default courseService;
