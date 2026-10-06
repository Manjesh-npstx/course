import PropTypes from "prop-types";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import "@/features/courses/CourseTable.css";

/**
 * Table displaying registered users with status, enrolled courses, and administrative actions.
 */
export function UserDirectoryTable({
    users,
    onToggleStatus,
    onEnroll,
    currentUserEmail = "",
    showCourses = true,
}) {
    return (
        <div className="table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Status</th>
                        {showCourses && <th>Enrolled Courses</th>}
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((u) => {
                        const isActive =
                            (u.status || "").toLowerCase() === "active";
                        const isSelf =
                            currentUserEmail &&
                            u.email.toLowerCase() ===
                                currentUserEmail.toLowerCase();
                        const courses = Array.isArray(u.enrolledCourses)
                            ? u.enrolledCourses
                            : [];

                        return (
                            <tr key={u.id}>
                                <td className="td-bold">{u.name}</td>
                                <td>{u.email}</td>
                                <td>
                                    <Badge
                                        variant={
                                            isActive ? "success" : "danger"
                                        }
                                    >
                                        {isActive ? "ACTIVE" : "DISABLED"}
                                    </Badge>
                                </td>
                                {showCourses && (
                                    <td>
                                        {courses.length > 0 ? (
                                            <div className="course-badge-list">
                                                {courses.map((courseName) => (
                                                    <Badge
                                                        key={courseName}
                                                        variant="primary"
                                                    >
                                                        {courseName}
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="td-muted">
                                                No courses enrolled
                                            </span>
                                        )}
                                    </td>
                                )}
                                <td>
                                    <div className="table-action-group">
                                        {onEnroll && u.role === "student" && (
                                            <Button
                                                size="small"
                                                variant="secondary"
                                                onClick={() => onEnroll(u)}
                                                disabled={!isActive}
                                                title={
                                                    !isActive
                                                        ? "Cannot enroll disabled student"
                                                        : "Enroll into course"
                                                }
                                            >
                                                + Enroll
                                            </Button>
                                        )}
                                        {onToggleStatus && !isSelf && (
                                            <Button
                                                size="small"
                                                variant={
                                                    isActive
                                                        ? "danger"
                                                        : "secondary"
                                                }
                                                onClick={() =>
                                                    onToggleStatus(u)
                                                }
                                            >
                                                {isActive
                                                    ? "Disable"
                                                    : "Enable"}
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

UserDirectoryTable.propTypes = {
    users: PropTypes.arrayOf(PropTypes.object).isRequired,
    onToggleStatus: PropTypes.func,
    onEnroll: PropTypes.func,
    currentUserEmail: PropTypes.string,
    showCourses: PropTypes.bool,
};

export default UserDirectoryTable;
