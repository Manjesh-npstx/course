import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import { ROUTES } from "@/constants/routes";
import "./CourseTable.css";

function getSeatBadge(course) {
    const enrolled = course.students ? course.students.length : 0;
    const remaining = course.seatLimit - enrolled;

    if (remaining <= 0) {
        return (
            <Badge variant="danger">
                Full ({course.seatLimit}/{course.seatLimit})
            </Badge>
        );
    }
    if (remaining <= course.seatLimit * 0.2) {
        return (
            <Badge variant="warning">
                {remaining} left ({enrolled}/{course.seatLimit})
            </Badge>
        );
    }
    return (
        <Badge variant="success">
            {remaining} left ({enrolled}/{course.seatLimit})
        </Badge>
    );
}

function getStatusBadge(status) {
    const s = (status || "approved").toLowerCase();
    if (s === "approved") return <Badge variant="success">Approved</Badge>;
    if (s === "pending") return <Badge variant="warning">Pending</Badge>;
    if (s === "rejected") return <Badge variant="danger">Rejected</Badge>;
    return <Badge variant="default">{status}</Badge>;
}

/**
 * Course data table rendering rows and role-aware actions.
 */
export function CourseTable({
    courses,
    onEdit,
    onDelete,
    onApprove,
    onReject,
    onEnroll,
    isAdmin = false,
    isInstructor = false,
    isStudent = false,
    currentUserEmail = "",
    enrolledCourseIds = [],
}) {
    const showActions = isAdmin || isInstructor || isStudent;

    return (
        <div className="table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Course Name</th>
                        <th>Instructor</th>
                        <th>Status</th>
                        <th>Seats</th>
                        {showActions && <th>Actions</th>}
                    </tr>
                </thead>
                <tbody>
                        const isOwn =
                            isInstructor &&
                            ((course.instructorEmail &&
                                currentUserEmail &&
                                course.instructorEmail.toLowerCase() ===
                                    currentUserEmail.toLowerCase()) ||
                                (currentUserEmail &&
                                    [
                                        "instructor@campus.com",
                                        "instructor1@campus.com",
                                    ].includes(
                                        currentUserEmail.toLowerCase()
                                    ) &&
                                    [
                                        "instructor@campus.com",
                                        "instructor1@campus.com",
                                    ].includes(
                                        (
                                            course.instructorEmail || ""
                                        ).toLowerCase()
                                    )));
                        const isPending =
                            (course.status || "").toLowerCase() === "pending";
                        const isEnrolled = enrolledCourseIds.includes(
                            course.id
                        );
                        const enrolledCount = course.students
                            ? course.students.length
                            : 0;
                        const isFull = enrolledCount >= course.seatLimit;

                        return (
                            <tr key={course.id}>
                                <td>
                                    <Link
                                        to={ROUTES.COURSE_DETAIL(course.id)}
                                        className="table-link"
                                    >
                                        {course.name}
                                    </Link>
                                </td>
                                <td>{course.instructor}</td>
                                <td>{getStatusBadge(course.status)}</td>
                                <td>{getSeatBadge(course)}</td>
                                {showActions && (
                                    <td>
                                        <div className="table-action-group">
                                            {isAdmin &&
                                                isPending &&
                                                onApprove && (
                                                    <button
                                                        type="button"
                                                        className="icon-action-btn icon-action-btn-success"
                                                        title="Approve Course"
                                                        onClick={() =>
                                                            onApprove(course)
                                                        }
                                                    >
                                                        ✓
                                                    </button>
                                                )}
                                            {isAdmin &&
                                                isPending &&
                                                onReject && (
                                                    <button
                                                        type="button"
                                                        className="icon-action-btn icon-action-btn-danger"
                                                        title="Reject Course"
                                                        onClick={() =>
                                                            onReject(course)
                                                        }
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                            {isAdmin && onEdit && (
                                                <button
                                                    type="button"
                                                    className="icon-action-btn"
                                                    title="Edit Course"
                                                    onClick={() =>
                                                        onEdit(course)
                                                    }
                                                >
                                                    ✎
                                                </button>
                                            )}
                                            {isAdmin && onDelete && (
                                                <button
                                                    type="button"
                                                    className="icon-action-btn icon-action-btn-danger"
                                                    title={
                                                        enrolledCount > 0
                                                            ? "Cannot delete course with active student enrollments"
                                                            : "Delete Course"
                                                    }
                                                    disabled={enrolledCount > 0}
                                                    onClick={() =>
                                                        onDelete(course)
                                                    }
                                                >
                                                    🗑
                                                </button>
                                            )}

                                            {!isAdmin &&
                                                isInstructor &&
                                                isOwn && (
                                                    <button
                                                        type="button"
                                                        className="icon-action-btn"
                                                        title="Edit Course"
                                                        onClick={() =>
                                                            onEdit(course)
                                                        }
                                                    >
                                                        ✎
                                                    </button>
                                                )}

                                            {isStudent && (
                                                <>
                                                    {isEnrolled ? (
                                                        <Badge variant="success">
                                                            ✓ Enrolled
                                                        </Badge>
                                                    ) : isFull ? (
                                                        <Badge variant="default">
                                                            Full
                                                        </Badge>
                                                    ) : (
                                                          course.status || ""
                                                      ).toLowerCase() ===
                                                      "approved" ? (
                                                        <Button
                                                            size="small"
                                                            onClick={() =>
                                                                onEnroll &&
                                                                onEnroll(course)
                                                            }
                                                        >
                                                            Enroll
                                                        </Button>
                                                    ) : null}
                                                </>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

CourseTable.propTypes = {
    courses: PropTypes.arrayOf(PropTypes.object).isRequired,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    onApprove: PropTypes.func,
    onReject: PropTypes.func,
    onEnroll: PropTypes.func,
    isAdmin: PropTypes.bool,
    isInstructor: PropTypes.bool,
    isStudent: PropTypes.bool,
    currentUserEmail: PropTypes.string,
    enrolledCourseIds: PropTypes.arrayOf(
        PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    ),
};

export default CourseTable;
