import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Alert from "@/components/common/Alert";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Modal from "@/components/common/Modal";
import { userService } from "@/services/userService";

/**
 * Modal dialog for updating an enrolled student.
 */
export function EditStudentModal({
    isOpen,
    onClose,
    onSubmit,
    student,
    courses = [],
}) {
    const [name, setName] = useState(student?.name || "");
    const [email, setEmail] = useState(student?.email || "");
    const [courseId, setCourseId] = useState(
        String(student?.course?.id || student?.courseId || "")
    );
    const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
    const [enrolledCourseNames, setEnrolledCourseNames] = useState([]);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currentCourseId = Number(student?.course?.id || student?.courseId);

    useEffect(() => {
        let isMounted = true;
        if (isOpen && student?.email) {
            userService
                .getActiveStudents()
                .then((studentsList) => {
                    if (!isMounted) return;
                    const found = (studentsList || []).find(
                        (s) =>
                            s.email?.toLowerCase() ===
                            student.email.trim().toLowerCase()
                    );
                    if (found) {
                        setEnrolledCourseIds(
                            (found.enrolledCourseIds || []).map(Number)
                        );
                        setEnrolledCourseNames(
                            (found.enrolledCourses || []).map((n) =>
                                String(n).trim().toLowerCase()
                            )
                        );
                    }
                })
                .catch(() => {});
        }
        return () => {
            isMounted = false;
        };
    }, [isOpen, student?.email]);

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        if (!name.trim()) {
            setError("Student name is required");
            return;
        }
        if (!email.trim() || !email.includes("@")) {
            setError("Valid student email is required");
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({
                name: name.trim(),
                email: email.trim(),
                courseId: courseId ? Number(courseId) : undefined,
            });
            onClose();
        } catch (err) {
            setError(err.message || "Failed to update student");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Student">
            <Alert>{error}</Alert>
            <form onSubmit={handleSubmit} noValidate>
                <Input
                    id="edit-student-name"
                    name="name"
                    label="Student Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
                    required
                />
                <Input
                    id="edit-student-email"
                    name="email"
                    type="email"
                    label="Student Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    required
                />
                {courses.length > 0 &&
                    (() => {
                        const selectableCourses = courses.filter((c) => {
                            const cId = Number(c.id);
                            if (
                                cId !== currentCourseId &&
                                enrolledCourseIds.includes(cId)
                            ) {
                                return false;
                            }
                            if (
                                cId !== currentCourseId &&
                                c.name &&
                                enrolledCourseNames.includes(
                                    String(c.name).trim().toLowerCase()
                                )
                            ) {
                                return false;
                            }
                            return true;
                        });

                        return (
                            <div className="input-group">
                                <label
                                    htmlFor="edit-course-select"
                                    className="input-label"
                                >
                                    Change Course
                                </label>
                                <select
                                    id="edit-course-select"
                                    className="input-field"
                                    value={courseId}
                                    onChange={(e) =>
                                        setCourseId(e.target.value)
                                    }
                                    disabled={isSubmitting}
                                >
                                    <option value="">
                                        Keep current course
                                    </option>
                                    {selectableCourses.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} ({c.instructor})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        );
                    })()}
                <div className="modal-actions">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

EditStudentModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    student: PropTypes.object,
    courses: PropTypes.arrayOf(PropTypes.object),
};

export default EditStudentModal;
