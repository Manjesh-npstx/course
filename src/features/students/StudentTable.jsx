import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { ROUTES } from "@/constants/routes";
import "@/features/courses/CourseTable.css";

/**
 * Student list data table with optional course details and admin actions.
 */
export function StudentTable({
    students,
    showCourse = true,
    onEdit,
    onDelete,
    isAdmin = false,
}) {
    return (
        <div className="table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Student Name</th>
                        <th>Email</th>
                        {showCourse && <th>Course</th>}
                        <th>Enrolled Date</th>
                        {isAdmin && <th>Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {students.map((student) => (
                        <tr key={student.id}>
                            <td className="td-bold">{student.name}</td>
                            <td>{student.email}</td>
                            {showCourse && (
                                <td>
                                    {student.course ? (
                                        <Link
                                            to={ROUTES.COURSE_DETAIL(
                                                student.course.id
                                            )}
                                            className="table-link"
                                        >
                                            {student.course.name}
                                        </Link>
                                    ) : (
                                        <span className="td-muted">
                                            Unknown
                                        </span>
                                    )}
                                </td>
                            )}
                            <td>{student.enrollDate || "N/A"}</td>
                            {isAdmin && (
                                <td>
                                    <div className="table-action-group">
                                        {onEdit && (
                                            <button
                                                type="button"
                                                className="icon-action-btn"
                                                title="Edit Student"
                                                onClick={() => onEdit(student)}
                                            >
                                                ✎
                                            </button>
                                        )}
                                        {onDelete && (
                                            <button
                                                type="button"
                                                className="icon-action-btn icon-action-btn-danger"
                                                title="Remove Student"
                                                onClick={() =>
                                                    onDelete(student)
                                                }
                                            >
                                                🗑
                                            </button>
                                        )}
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

StudentTable.propTypes = {
    students: PropTypes.arrayOf(PropTypes.object).isRequired,
    showCourse: PropTypes.bool,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    isAdmin: PropTypes.bool,
};

export default StudentTable;
