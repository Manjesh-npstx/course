import { API_ENDPOINTS } from "@/constants/api";
import api from "@/services/api";

/**
 * Service handling user management and admin status updates.
 */
export const userService = {
    /**
     * List registered users with optional role, status, and search filters.
     *
     * @param {Object} [params]
     * @param {number} [params.page=1]
     * @param {number} [params.limit=10]
     * @param {string} [params.role='']
     * @param {string} [params.status='']
     * @param {string} [params.search='']
     * @returns {Promise<{ data: Array, meta: Object }>}
     */
    async getUsers({
        page = 1,
        limit = 10,
        role = "",
        status = "",
        search = "",
    } = {}) {
        const params = { page, limit };
        if (role) params.role = role;
        if (status) params.status = status;
        if (search) params.search = search;
        return api.get(API_ENDPOINTS.USERS, { params });
    },

    /**
     * Fetch active students for enrollment selection dropdowns.
     *
     * @returns {Promise<Array>}
     */
    async getActiveStudents() {
        return api.get(API_ENDPOINTS.ACTIVE_STUDENTS);
    },

    /**
     * Update user account status (ACTIVE or DISABLED).
     *
     * @param {number|string} id
     * @param {string} status - 'active' or 'disabled'
     * @returns {Promise<Object>}
     */
    async updateStatus(id, status) {
        return api.patch(API_ENDPOINTS.USER_STATUS(id), { status });
    },
};

export default userService;
