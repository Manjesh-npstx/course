import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import Pagination from "@/components/common/Pagination";
import Toast from "@/components/common/Toast";
import { ROUTES } from "@/constants/routes";
import EditStudentModal from "@/features/students/EditStudentModal";
import EnrollStudentModal from "@/features/students/EnrollStudentModal";
import StudentTable from "@/features/students/StudentTable";
import { useAuth } from "@/hooks/useAuth";
import { courseService } from "@/services/courseService";
import { studentService } from "@/services/studentService";
import "./CoursesPage.css";
import "./CourseDetailPage.css";

/**
 * Course detail view displaying enrolled students and course enrollment actions.
 */
export function CourseDetailPage() {
    const { id } = useParams();
    const courseId = Number(id);
    const { user, isAdmin, isInstructor, isStudent } = useAuth();

    const [course, setCourse] = useState(null);
    const [students, setStudents] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const [enrollOpen, setEnrollOpen] = useState(false);
    const [editStudent, setEditStudent] = useState(null);
    const [deleteStudent, setDeleteStudent] = useState(null);
    const [toast, setToast] = useState(null);
    const [refreshIndex, setRefreshIndex] = useState(0);

    useEffect(() => {
        let isMounted = true;
        async function loadCourse() {
            try {
                const data = await courseService.getCourseById(courseId);
                if (isMounted) setCourse(data);
            } catch {
                if (isMounted) {
                    setToast({
                        message: "Failed to load course details",
                        type: "error",
                    });
                }
            }
        }
        loadCourse();
        return () => {
            isMounted = false;
        };
    }, [courseId, refreshIndex]);

    useEffect(() => {
        let isMounted = true;
        async function loadStudents() {
            try {
                const res = await courseService.getCourseStudents(courseId, {
                    page,
                    limit: 10,
                });
                if (isMounted) {
                    setStudents(res.data || []);
                    setTotalPages(res.meta?.totalPages || 1);
                    setTotal(res.meta?.total || 0);
                    setLoading(false);
                }
            } catch {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }
        loadStudents();
        return () => {
            isMounted = false;
        };
    }, [courseId, page, refreshIndex]);

    function reload() {
        setLoading(true);
        setRefreshIndex((prev) => prev + 1);
    }

    async function handleApprove() {
        try {
            await courseService.approveCourse(courseId);
            setToast({
                message: "Course approved successfully!",
                type: "success",
            });
            reload();
        } catch (err) {
            setToast({ message: err.message, type: "error" });
        }
    }

    async function handleReject() {
        try {
            await courseService.rejectCourse(courseId);
            setToast({ message: "Course rejected", type: "success" });
            reload();
        } catch (err) {
            setToast({ message: err.message, type: "error" });
        }
    }

    async function handleSelfEnroll() {
        try {
            await courseService.enroll(courseId, user?.name);
            setToast({
                message: "Successfully enrolled in this course!",
                type: "success",
            });
            reload();
        } catch (err) {
            setToast({ message: err.message, type: "error" });
        }
    }

    async function handleEnrollAdmin(data) {
        await studentService.enrollStudent(data);
        setToast({
            message: "Student enrolled successfully",
            type: "success",
        });
        reload();
    }

    async function handleEditStudent(data) {
        if (!editStudent) return;
        await studentService.updateStudent(editStudent.id, data);
        setToast({
            message: "Student updated successfully",
            type: "success",
        });
        setEditStudent(null);
        reload();
    }

    async function handleDeleteStudent() {
        if (!deleteStudent) return;
        try {
            await studentService.deleteStudent(deleteStudent.id);
            setToast({
                message: "Student removed successfully",
                type: "success",
            });
            setDeleteStudent(null);
            reload();
        } catch {
            setToast({
                message: "Failed to remove student",
                type: "error",
            });
        }
    }

    if (!course && !loading) {
        return (
            <div className="page">
                <div className="section-card table-loading">
                    <p>Course not found</p>
                    <Link to={ROUTES.COURSES}>
                        <Button size="small">Back to Courses</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const enrolled = course?.students ? course.students.length : 0;
    const available = (course?.seatLimit || 0) - enrolled;
    const isFull = available <= 0;
    const isPending = (course?.status || "").toLowerCase() === "pending";
    const isApproved = (course?.status || "").toLowerCase() === "approved";
    const isCurrentUserEnrolled =
        isStudent && students.some((s) => s.email === user?.email);

    return (
        <div className="page">
            <Link to={ROUTES.COURSES} className="back-link">
                &larr; Back to Courses
            </Link>

            <div className="course-detail-header-card">
                <div className="course-detail-top">
                    <div>
                        <div className="course-detail-title-row">
                            <h1 className="page-title">{course?.name}</h1>
                            {isApproved && (
                                <Badge variant="success">Approved</Badge>
                            )}
                            {isPending && (
                                <Badge variant="warning">Pending</Badge>
                            )}
                            {isInstructor &&
                                course?.instructorEmail === user?.email && (
                                    <Badge variant="primary">Your Course</Badge>
                                )}
                        </div>
                        <p className="course-detail-meta">
                            Instructor: <strong>{course?.instructor}</strong>
                        </p>
                    </div>

                    <div className="table-action-group">
                        {isAdmin && isPending && (
                            <>
                                <Button size="small" onClick={handleApprove}>
                                    ✓ Approve Course
                                </Button>
                                <Button
                                    size="small"
                                    variant="danger"
                                    onClick={handleReject}
                                >
                                    ✕ Reject
                                </Button>
                            </>
                        )}

                        {isStudent && (
                            <>
                                {isCurrentUserEnrolled ? (
                                    <Badge variant="success">
                                        ✓ You are enrolled
                                    </Badge>
                                ) : isApproved && !isFull ? (
                                    <Button
                                        size="small"
                                        onClick={handleSelfEnroll}
                                    >
                                        Enroll in this Course
                                    </Button>
                                ) : isFull ? (
                                    <Badge variant="default">Course Full</Badge>
                                ) : null}
                            </>
                        )}
                    </div>
                </div>

                <div className="course-detail-seats">
                    {isFull ? (
                        <Badge variant="danger">
                            Full — {enrolled}/{course?.seatLimit} seats
                        </Badge>
                    ) : (
                        <Badge variant="success">
                            {available} seats available ({enrolled}/
                            {course?.seatLimit})
                        </Badge>
                    )}
                </div>
            </div>

            <div className="page-header">
                <h2 className="section-title">Enrolled Students</h2>
                {isAdmin && (
                    <Button
                        size="small"
                        disabled={isFull}
                        onClick={() => setEnrollOpen(true)}
                    >
                        {isFull ? "Course Full" : "+ Enroll Student"}
                    </Button>
                )}
            </div>

            <div className="section-card">
                {loading ? (
                    <div className="table-loading">Loading students...</div>
                ) : students.length === 0 ? (
                    <div className="table-loading">
                        No students enrolled yet
                    </div>
                ) : (
                    <>
                        <StudentTable
                            students={students}
                            showCourse={false}
                            onEdit={isAdmin ? setEditStudent : undefined}
                            onDelete={isAdmin ? setDeleteStudent : undefined}
                            isAdmin={isAdmin}
                        />
                        <Pagination
                            page={page}
                            totalPages={totalPages}
                            total={total}
                            onPageChange={setPage}
                        />
                    </>
                )}
            </div>

            <EnrollStudentModal
                isOpen={enrollOpen}
                onClose={() => setEnrollOpen(false)}
                onSubmit={handleEnrollAdmin}
                preselectedCourseId={courseId}
            />

            <EditStudentModal
                key={editStudent?.id || "none"}
                isOpen={Boolean(editStudent)}
                student={editStudent}
                onClose={() => setEditStudent(null)}
                onSubmit={handleEditStudent}
            />

            <ConfirmDialog
                isOpen={Boolean(deleteStudent)}
                title="Remove Student"
                message={`Are you sure you want to remove "${deleteStudent?.name}" from this course?`}
                onClose={() => setDeleteStudent(null)}
                onConfirm={handleDeleteStudent}
            />

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}

export default CourseDetailPage;
