import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Alert from "@/components/common/Alert";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Modal from "@/components/common/Modal";

/**
 * Modal form dialog for creating or editing a course.
 */
export function CourseFormModal({
    isOpen,
    onClose,
    onSubmit,
    course = null,
    defaultInstructor = "",
    isInstructorFixed = false,
}) {
    const [name, setName] = useState(course?.name || "");
    const [instructor, setInstructor] = useState(
        course?.instructor || defaultInstructor || ""
    );
    const [seatLimit, setSeatLimit] = useState(course?.seatLimit || 30);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isInstructorFixed) {
            if (course?.instructor) {
                setInstructor(course.instructor);
            } else if (defaultInstructor) {
                setInstructor(defaultInstructor);
            }
        }
    }, [isInstructorFixed, course, defaultInstructor]);

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        if (!name.trim()) {
            setError("Course name is required");
            return;
        }
        const effectiveInstructor = isInstructorFixed
            ? (course?.instructor || defaultInstructor || instructor || "").trim()
            : instructor.trim();

        if (!effectiveInstructor) {
            setError("Instructor name is required");
            return;
        }
        const seats = Number(seatLimit);
        if (Number.isNaN(seats) || seats < 1) {
            setError("Seat limit must be at least 1");
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({
                name: name.trim(),
                instructor: effectiveInstructor,
                seatLimit: seats,
            });
            onClose();
        } catch (err) {
            setError(err.message || "Failed to save course");
        } finally {
            setIsSubmitting(false);
        }
    }

    const title = course ? "Edit Course" : "Create New Course";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <Alert>{error}</Alert>
            <form onSubmit={handleSubmit} noValidate>
                <Input
                    id="course-name"
                    name="name"
                    label="Course Name"
                    placeholder="e.g. Distributed Systems"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
                    required
                />
                <Input
                    id="course-instructor"
                    name="instructor"
                    label="Instructor"
                    placeholder="e.g. Dr. Jane Doe"
                    value={
                        isInstructorFixed
                            ? (course?.instructor || defaultInstructor || instructor)
                            : instructor
                    }
                    onChange={(e) => setInstructor(e.target.value)}
                    disabled={isInstructorFixed || isSubmitting}
                    required
                    helperText={
                        isInstructorFixed
                            ? "Instructor is locked to your account profile."
                            : ""
                    }
                />
                <Input
                    id="course-seat-limit"
                    name="seatLimit"
                    label="Seat Capacity"
                    type="number"
                    min="1"
                    value={seatLimit}
                    onChange={(e) => setSeatLimit(e.target.value)}
                    disabled={isSubmitting}
                    required
                />
                <div className="modal-actions">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting
                            ? "Saving..."
                            : course
                              ? "Save Changes"
                              : "Create Course"}
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

CourseFormModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    course: PropTypes.object,
    defaultInstructor: PropTypes.string,
    isInstructorFixed: PropTypes.bool,
};

export default CourseFormModal;
