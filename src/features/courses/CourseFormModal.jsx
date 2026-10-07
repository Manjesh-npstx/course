import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Alert from "@/components/common/Alert";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Modal from "@/components/common/Modal";
import { userService } from "@/services/userService";

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
    instructors = [],
}) {
    const [name, setName] = useState(course?.name || "");
    const [selectedInstructorEmail, setSelectedInstructorEmail] = useState(
        course?.instructorEmail || ""
    );
    const [seatLimit, setSeatLimit] = useState(course?.seatLimit || 30);
    const [fetchedInstructors, setFetchedInstructors] = useState([]);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const instructorList =
        instructors.length > 0 ? instructors : fetchedInstructors;

    useEffect(() => {
        let isMounted = true;
        if (isOpen && !isInstructorFixed && instructors.length === 0) {
            userService
                .getActiveInstructors()
                .then((data) => {
                    if (isMounted) {
                        setFetchedInstructors(data || []);
                    }
                })
                .catch(() => {
                    // Ignore background load error
                });
        }
        return () => {
            isMounted = false;
        };
    }, [isOpen, isInstructorFixed, instructors.length]);

    // Derive active email selection if editing existing course
    const activeEmail =
        selectedInstructorEmail ||
        (course?.instructorEmail
            ? course.instructorEmail
            : course?.instructor
              ? instructorList.find(
                    (i) =>
                        i.name.toLowerCase() ===
                            course.instructor.toLowerCase() ||
                        i.email.toLowerCase() ===
                            course.instructor.toLowerCase()
                )?.email || ""
              : "");

    function handleInstructorChange(event) {
        setSelectedInstructorEmail(event.target.value);
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        if (!name.trim()) {
            setError("Course name is required");
            return;
        }

        const effectiveEmail = isInstructorFixed
            ? (course?.instructorEmail || "").trim()
            : activeEmail.trim();

        if (!isInstructorFixed && !effectiveEmail) {
            setError("Please select an instructor");
            return;
        }

        const matchedInstructor = instructorList.find(
            (i) => i.email.toLowerCase() === effectiveEmail.toLowerCase()
        );

        const effectiveName = isInstructorFixed
            ? (course?.instructor || defaultInstructor || "").trim()
            : (matchedInstructor?.name || course?.instructor || "").trim();

        if (!effectiveName) {
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
                instructor: effectiveName,
                instructorEmail: effectiveEmail || null,
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
                {isInstructorFixed ? (
                    <Input
                        id="course-instructor"
                        name="instructor"
                        label="Instructor"
                        placeholder="e.g. Dr. Jane Doe"
                        value={course?.instructor || defaultInstructor || ""}
                        disabled
                        required
                        helperText="Instructor is locked to your account profile."
                    />
                ) : (
                    <div className="input-group">
                        <label
                            htmlFor="course-instructor-select"
                            className="input-label"
                        >
                            Instructor{" "}
                            <span
                                className="required-asterisk"
                                aria-hidden="true"
                            >
                                *
                            </span>
                        </label>
                        <select
                            id="course-instructor-select"
                            name="instructor"
                            className="input-field"
                            value={activeEmail}
                            onChange={handleInstructorChange}
                            disabled={isSubmitting}
                            required
                        >
                            <option value="">Select an instructor...</option>
                            {instructorList.map((inst) => (
                                <option
                                    key={inst.id || inst.email}
                                    value={inst.email}
                                >
                                    {inst.name} ({inst.email})
                                </option>
                            ))}
                        </select>
                        {instructorList.length === 0 && (
                            <p
                                className="input-helper-text"
                                style={{
                                    color: "var(--color-warning, #d97706)",
                                }}
                            >
                                No active instructors found. An instructor must
                                register first.
                            </p>
                        )}
                    </div>
                )}
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
    instructors: PropTypes.arrayOf(PropTypes.object),
};

export default CourseFormModal;
