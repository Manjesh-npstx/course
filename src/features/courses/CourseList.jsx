import PropTypes from "prop-types";
import CourseCard from "@/features/courses/CourseCard";
import "./CourseList.css";

/**
 * Course grid list with empty state handling.
 */
export function CourseList({
    courses,
    role,
    enrolledCourseIds = [],
    onEnroll,
    onApprove,
    onReject,
    onDelete,
    emptyMessage = "No courses available at this time.",
}) {
    if (!courses || courses.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">📚</div>
                <h3 className="empty-state-title">No Courses Found</h3>
                <p className="empty-state-text">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="course-grid">
            {courses.map((course) => (
                <CourseCard
                    key={course.id}
                    course={course}
                    role={role}
                    isEnrolled={enrolledCourseIds.includes(course.id)}
                    onEnroll={onEnroll}
                    onApprove={onApprove}
                    onReject={onReject}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}

CourseList.propTypes = {
    courses: PropTypes.arrayOf(PropTypes.object).isRequired,
    role: PropTypes.string,
    enrolledCourseIds: PropTypes.arrayOf(
        PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    ),
    onEnroll: PropTypes.func,
    onApprove: PropTypes.func,
    onReject: PropTypes.func,
    onDelete: PropTypes.func,
    emptyMessage: PropTypes.string,
};

export default CourseList;
