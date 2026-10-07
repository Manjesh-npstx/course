import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Alert from "@/components/common/Alert";
import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";
import { useAuth } from "@/hooks/useAuth";
import { userService } from "@/services/userService";

/**
 * Modal dialog for enrolling a registered student into a selected course.
 */
export function EnrollStudentModal({
    isOpen,
    onClose,
    onSubmit,
    courses = [],
    preselectedCourseId = null,
    preselectedStudent = null,
    registeredStudents = [],
}) {
    const { user, isStudent } = useAuth();
    const effectivePreselectedStudent =
        preselectedStudent || (isStudent ? user : null);

    const [customCourseId, setCustomCourseId] = useState("");
    const [customEmail, setCustomEmail] = useState("");
    const [fetchedStudents, setFetchedStudents] = useState([]);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const courseId = preselectedCourseId
        ? String(preselectedCourseId)
        : customCourseId;
    const selectedEmail = effectivePreselectedStudent?.email || customEmail;
    const studentsList =
        registeredStudents.length > 0 ? registeredStudents : fetchedStudents;

    useEffect(() => {
        let isMounted = true;
        if (isOpen && registeredStudents.length === 0) {
            userService
                .getActiveStudents()
                .then((data) => {
                    if (isMounted) setFetchedStudents(data || []);
                })
                .catch(() => {
                    // Ignore background load error
                });
        }
        return () => {
            isMounted = false;
        };
    }, [isOpen, registeredStudents.length]);

    function handleClose() {
        setCustomCourseId("");
        setCustomEmail("");
        setError("");
        onClose();
    }

    const currentStudent =
        studentsList.find(
            (s) =>
                s.email?.toLowerCase() ===
                (selectedEmail || "").trim().toLowerCase()
        ) || effectivePreselectedStudent;

    const studentEnrolledIds = new Set(
        (currentStudent?.enrolledCourseIds || []).map(Number)
    );
    const studentEnrolledNames = new Set(
        (currentStudent?.enrolledCourses || []).map((n) =>
            String(n).trim().toLowerCase()
        )
    );

    const approvedCourses = courses.filter(
        (c) => (c.status || "approved").toLowerCase() === "approved"
    );

    // If a student is selected, filter out courses they are already enrolled in
    const availableCourses = approvedCourses.filter((c) => {
        if (!selectedEmail) return true;
        if (studentEnrolledIds.has(Number(c.id))) return false;
        if (
            c.name &&
            studentEnrolledNames.has(String(c.name).trim().toLowerCase())
        ) {
            return false;
        }
        return true;
    });

    // If a course is preselected, filter out students already enrolled in that course
    const availableStudents = preselectedCourseId
        ? studentsList.filter((s) => {
              const sCourseIds = (s.enrolledCourseIds || []).map(Number);
              if (sCourseIds.includes(Number(preselectedCourseId))) {
                  return false;
              }
              const preCourse = courses.find(
                  (c) => String(c.id) === String(preselectedCourseId)
              );
              if (
                  preCourse &&
                  (s.enrolledCourses || []).some(
                      (name) =>
                          String(name).trim().toLowerCase() ===
                          String(preCourse.name).trim().toLowerCase()
                  )
              ) {
                  return false;
              }
              return true;
          })
        : studentsList;

    function handleStudentChange(email) {
        setCustomEmail(email);
        if (customCourseId) {
            const chosenStudent = studentsList.find(
                (s) => s.email?.toLowerCase() === email.trim().toLowerCase()
            );
            if (chosenStudent) {
                const sIds = new Set(
                    (chosenStudent.enrolledCourseIds || []).map(Number)
                );
                const sNames = new Set(
                    (chosenStudent.enrolledCourses || []).map((n) =>
                        String(n).trim().toLowerCase()
                    )
                );
                const curCourse = courses.find(
                    (c) => String(c.id) === String(customCourseId)
                );
                if (
                    sIds.has(Number(customCourseId)) ||
                    (curCourse &&
                        sNames.has(String(curCourse.name).trim().toLowerCase()))
                ) {
                    setCustomCourseId("");
                }
            }
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        const parsedCourseId = Number(courseId);
        if (!parsedCourseId) {
            setError("Please select a course");
            return;
        }

        const email = (selectedEmail || "").trim();
        if (!email) {
            setError("Please select a registered student");
            return;
        }

        if (
            !preselectedCourseId &&
            selectedEmail &&
            availableCourses.length === 0
        ) {
            setError(
                "This student is already enrolled in all available courses."
            );
            return;
        }

        const student =
            studentsList.find(
                (s) => s.email?.toLowerCase() === email.toLowerCase()
            ) || effectivePreselectedStudent;
        const name = (student?.name || email).trim();

        setIsSubmitting(true);
        try {
            await onSubmit({
                name,
                email,
                courseId: parsedCourseId,
            });
            handleClose();
        } catch (err) {
            setError(err.message || "Failed to enroll student");
        } finally {
            setIsSubmitting(false);
        }
    }

    const hasNoCoursesForStudent =
        Boolean(selectedEmail) &&
        !preselectedCourseId &&
        availableCourses.length === 0;
    const hasNoStudentsForCourse =
        Boolean(preselectedCourseId) &&
        !effectivePreselectedStudent &&
        availableStudents.length === 0;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Enroll Student">
            <Alert>{error}</Alert>
            <form onSubmit={handleSubmit} noValidate>
                {!effectivePreselectedStudent && (
                    <div className="input-group">
                        <label
                            htmlFor="enroll-student-select"
                            className="input-label"
                        >
                            Select Registered Student{" "}
                            <span
                                className="required-asterisk"
                                aria-hidden="true"
                            >
                                *
                            </span>
                        </label>
                        <select
                            id="enroll-student-select"
                            className="input-field"
                            value={customEmail}
                            onChange={(e) =>
                                handleStudentChange(e.target.value)
                            }
                            disabled={isSubmitting || hasNoStudentsForCourse}
                            required
                        >
                            <option value="">
                                {hasNoStudentsForCourse
                                    ? "All registered students are already enrolled"
                                    : "Choose a student..."}
                            </option>
                            {availableStudents.map((s) => (
                                <option key={s.id} value={s.email}>
                                    {s.name} ({s.email})
                                </option>
                            ))}
                        </select>
                        {hasNoStudentsForCourse && (
                            <p
                                className="field-hint"
                                style={{
                                    color: "var(--color-text-muted, #64748b)",
                                    fontSize: "0.85rem",
                                    marginTop: "4px",
                                }}
                            >
                                All registered students are already enrolled in
                                this course.
                            </p>
                        )}
                    </div>
                )}

                {effectivePreselectedStudent && (
                    <div className="input-group">
                        <label className="input-label">Student</label>
                        <p className="card-description">
                            <strong>{effectivePreselectedStudent.name}</strong>{" "}
                            ({effectivePreselectedStudent.email})
                        </p>
                    </div>
                )}

                {!preselectedCourseId && (
                    <div className="input-group">
                        <label
                            htmlFor="enroll-course-select"
                            className="input-label"
                        >
                            Select Course{" "}
                            <span
                                className="required-asterisk"
                                aria-hidden="true"
                            >
                                *
                            </span>
                        </label>
                        <select
                            id="enroll-course-select"
                            className="input-field"
                            value={customCourseId}
                            onChange={(e) => setCustomCourseId(e.target.value)}
                            disabled={isSubmitting || hasNoCoursesForStudent}
                            required
                        >
                            <option value="">
                                {hasNoCoursesForStudent
                                    ? "Student is already enrolled in all available courses"
                                    : "Choose a course..."}
                            </option>
                            {availableCourses.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name} ({c.instructor})
                                </option>
                            ))}
                        </select>
                        {hasNoCoursesForStudent && (
                            <p
                                className="field-hint"
                                style={{
                                    color: "var(--color-danger, #ef4444)",
                                    fontSize: "0.85rem",
                                    marginTop: "4px",
                                }}
                            >
                                This student is already enrolled in all approved
                                courses.
                            </p>
                        )}
                    </div>
                )}

                <div className="modal-actions">
                    <Button
                        type="submit"
                        disabled={
                            isSubmitting ||
                            hasNoCoursesForStudent ||
                            hasNoStudentsForCourse
                        }
                    >
                        {isSubmitting ? "Enrolling..." : "Enroll Student"}
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

EnrollStudentModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    courses: PropTypes.arrayOf(PropTypes.object),
    preselectedCourseId: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
    ]),
    preselectedStudent: PropTypes.shape({
        name: PropTypes.string,
        email: PropTypes.string,
        enrolledCourses: PropTypes.arrayOf(PropTypes.string),
        enrolledCourseIds: PropTypes.arrayOf(PropTypes.number),
    }),
    registeredStudents: PropTypes.arrayOf(PropTypes.object),
};

export default EnrollStudentModal;
