import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Alert from "@/components/common/Alert";
import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";
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
    const [customCourseId, setCustomCourseId] = useState("");
    const [customEmail, setCustomEmail] = useState("");
    const [fetchedStudents, setFetchedStudents] = useState([]);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const courseId = preselectedCourseId
        ? String(preselectedCourseId)
        : customCourseId;
    const selectedEmail = preselectedStudent?.email || customEmail;
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

        const student =
            studentsList.find(
                (s) => s.email.toLowerCase() === email.toLowerCase()
            ) || preselectedStudent;
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

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Enroll Student">
            <Alert>{error}</Alert>
            <form onSubmit={handleSubmit} noValidate>
                {!preselectedStudent && (
                    <div className="input-group">
                        <label
                            htmlFor="enroll-student-select"
                            className="input-label"
                        >
                            Select Registered Student
                        </label>
                        <select
                            id="enroll-student-select"
                            className="input-field"
                            value={customEmail}
                            onChange={(e) => setCustomEmail(e.target.value)}
                            disabled={isSubmitting}
                            required
                        >
                            <option value="">Choose a student...</option>
                            {studentsList.map((s) => (
                                <option key={s.id} value={s.email}>
                                    {s.name} ({s.email})
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {preselectedStudent && (
                    <div className="input-group">
                        <label className="input-label">Student</label>
                        <p className="card-description">
                            <strong>{preselectedStudent.name}</strong> (
                            {preselectedStudent.email})
                        </p>
                    </div>
                )}

                {!preselectedCourseId && (
                    <div className="input-group">
                        <label
                            htmlFor="enroll-course-select"
                            className="input-label"
                        >
                            Select Course
                        </label>
                        <select
                            id="enroll-course-select"
                            className="input-field"
                            value={customCourseId}
                            onChange={(e) => setCustomCourseId(e.target.value)}
                            disabled={isSubmitting}
                            required
                        >
                            <option value="">Choose a course...</option>
                            {courses.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name} ({c.instructor})
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="modal-actions">
                    <Button type="submit" disabled={isSubmitting}>
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
    }),
    registeredStudents: PropTypes.arrayOf(PropTypes.object),
};

export default EnrollStudentModal;
