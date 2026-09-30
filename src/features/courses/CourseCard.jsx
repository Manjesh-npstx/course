import PropTypes from "prop-types";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import { ROLES } from "@/constants/roles";
import "./CourseCard.css";

/**
 * Course item card displaying details and role-appropriate actions.
 */
export function CourseCard({
    course,
    role,
    isEnrolled = false,
    onEnroll,
    onApprove,
    onReject,
    onDelete,
}) {
    const enrolledCount = course.students ? course.students.length : 0;
    const isPending =
        course.status && course.status.toLowerCase() === "pending";
    const statusVariant = isPending ? "warning" : "success";

    return (
        <div className="course-card">
            <div className="course-card-header">
                <h3 className="course-card-title">{course.name}</h3>
                <Badge variant={statusVariant}>{course.status}</Badge>
            </div>
            <div className="course-card-meta">
                <span>
                    <strong>Instructor:</strong> {course.instructor}
                </span>
                <span>
                    <strong>Seats:</strong> {enrolledCount} / {course.seatLimit}
                </span>
            </div>
            <div className="course-card-actions">
                {role === ROLES.STUDENT && (
                    <Button
                        size="small"
                        variant={isEnrolled ? "secondary" : "primary"}
                        disabled={isEnrolled}
                        onClick={() => onEnroll && onEnroll(course.id)}
                    >
                        {isEnrolled ? "Enrolled" : "Enroll"}
                    </Button>
                )}

                {role === ROLES.ADMIN && isPending && (
                    <>
                        <Button
                            size="small"
                            variant="primary"
                            onClick={() => onApprove && onApprove(course.id)}
                        >
                            Approve
                        </Button>
                        <Button
                            size="small"
                            variant="secondary"
                            onClick={() => onReject && onReject(course.id)}
                        >
                            Reject
                        </Button>
                    </>
                )}

                {role === ROLES.ADMIN && (
                    <Button
                        size="small"
                        variant="secondary"
                        onClick={() => onDelete && onDelete(course.id)}
                    >
                        Delete
                    </Button>
                )}
            </div>
        </div>
    );
}

CourseCard.propTypes = {
    course: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
            .isRequired,
        name: PropTypes.string.isRequired,
        instructor: PropTypes.string.isRequired,
        seatLimit: PropTypes.number.isRequired,
        status: PropTypes.string,
        students: PropTypes.array,
    }).isRequired,
    role: PropTypes.string,
    isEnrolled: PropTypes.bool,
    onEnroll: PropTypes.func,
    onApprove: PropTypes.func,
    onReject: PropTypes.func,
    onDelete: PropTypes.func,
};

export default CourseCard;
