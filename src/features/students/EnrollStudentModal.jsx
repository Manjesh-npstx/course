import { useState } from "react";
import PropTypes from "prop-types";
import Alert from "@/components/common/Alert";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Modal from "@/components/common/Modal";

/**
 * Modal dialog for enrolling a student into a selected course.
 */
export function EnrollStudentModal({
    isOpen,
    onClose,
    onSubmit,
    courses = [],
    preselectedCourseId = null,
}) {
    const [courseId, setCourseId] = useState(
        preselectedCourseId ? String(preselectedCourseId) : ""
    );
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        const parsedCourseId = Number(courseId || preselectedCourseId);
        if (!parsedCourseId) {
            setError("Please select a course");
            return;
        }
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
                courseId: parsedCourseId,
            });
            setName("");
            setEmail("");
            onClose();
        } catch (err) {
            setError(err.message || "Failed to enroll student");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Enroll Student">
            <Alert>{error}</Alert>
            <form onSubmit={handleSubmit} noValidate>
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
                            value={courseId}
                            onChange={(e) => setCourseId(e.target.value)}
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
                <Input
                    id="enroll-student-name"
                    name="name"
                    label="Student Name"
                    placeholder="e.g. John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
                    required
                />
                <Input
                    id="enroll-student-email"
                    name="email"
                    type="email"
                    label="Student Email"
                    placeholder="student@campus.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    required
                />
                <div className="modal-actions">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Enrolling..." : "Enroll Student"}
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

EnrollStudentModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    courses: PropTypes.arrayOf(PropTypes.object),
    preselectedCourseId: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
    ]),
};

export default EnrollStudentModal;
