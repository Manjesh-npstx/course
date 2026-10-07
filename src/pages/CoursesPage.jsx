import { useEffect, useState } from "react";
import Button from "@/components/common/Button";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import Pagination from "@/components/common/Pagination";
import SearchBar from "@/components/common/SearchBar";
import Toast from "@/components/common/Toast";
import { COURSE_MESSAGES } from "@/constants/messages";
import CourseFormModal from "@/features/courses/CourseFormModal";
import CourseTable from "@/features/courses/CourseTable";
import { useAuth } from "@/hooks/useAuth";
import { courseService } from "@/services/courseService";
import "./CoursesPage.css";

/**
 * Courses management page providing tabbed views, search, table actions, and modals.
 */
export function CoursesPage() {
    const { user, isAdmin, isInstructor, isStudent, canCreateCourse } =
        useAuth();

    const [courses, setCourses] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");
    const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);

    const [formOpen, setFormOpen] = useState(false);
    const [editCourse, setEditCourse] = useState(null);
    const [deleteCourse, setDeleteCourse] = useState(null);
    const [toast, setToast] = useState(null);
    const [refreshIndex, setRefreshIndex] = useState(0);

    // Fetch enrolled courses for student badge tracking
    useEffect(() => {
        if (!isStudent) return;
        let isMounted = true;
        async function fetchEnrolled() {
            try {
                const res = await courseService.getMyCourses({
                    page: 1,
                    limit: 100,
                });
                if (isMounted) {
                    setEnrolledCourseIds((res.data || []).map((c) => c.id));
                }
            } catch {
                // Ignore background fetch error
            }
        }
        fetchEnrolled();
        return () => {
            isMounted = false;
        };
    }, [isStudent, refreshIndex]);

    // Fetch courses list based on active tab & search
    useEffect(() => {
        let isMounted = true;
        async function fetchCourses() {
            try {
                let res;
                if (activeTab === "my") {
                    res = await courseService.getMyCourses({ page, limit: 10 });
                } else if (activeTab === "pending") {
                    res = await courseService.getCourses({
                        page,
                        limit: 10,
                        search,
                        status: "pending",
                    });
                } else {
                    res = await courseService.getCourses({
                        page,
                        limit: 10,
                        search,
                    });
                }
                if (isMounted) {
                    setCourses(res.data || []);
                    setTotalPages(res.meta?.totalPages || 1);
                    setTotal(res.meta?.total || 0);
                    setLoading(false);
                }
            } catch {
                if (isMounted) {
                    setToast({
                        message: COURSE_MESSAGES.FETCH_ERROR,
                        type: "error",
                    });
                    setLoading(false);
                }
            }
        }
        fetchCourses();
        return () => {
            isMounted = false;
        };
    }, [page, search, activeTab, refreshIndex]);

    function reload() {
        setLoading(true);
        setRefreshIndex((prev) => prev + 1);
    }

    async function handleSaveCourse(data) {
        if (editCourse) {
            await courseService.updateCourse(editCourse.id, data);
            setToast({
                message: "Course updated successfully",
                type: "success",
            });
        } else {
            await courseService.createCourse(data);
            setToast({
                message: isInstructor
                    ? COURSE_MESSAGES.SUBMIT_FOR_REVIEW
                    : COURSE_MESSAGES.CREATE_SUCCESS,
                type: "success",
            });
        }
        setEditCourse(null);
        reload();
    }

    async function handleDeleteConfirm() {
        if (!deleteCourse) return;
        const enrolledCount = deleteCourse.students
            ? deleteCourse.students.length
            : 0;
        if (enrolledCount > 0) {
            setToast({
                message:
                    "Cannot delete course with active student enrollments. Please unenroll all students first.",
                type: "error",
            });
            setDeleteCourse(null);
            return;
        }

        try {
            await courseService.deleteCourse(deleteCourse.id);
            setToast({
                message: COURSE_MESSAGES.DELETE_SUCCESS,
                type: "success",
            });
            setDeleteCourse(null);
            reload();
        } catch (err) {
            setToast({
                message: err.message || "Failed to delete course",
                type: "error",
            });
            setDeleteCourse(null);
        }
    }

    async function handleApprove(course) {
        try {
            await courseService.approveCourse(course.id);
            setToast({
                message: `"${course.name}" approved successfully`,
                type: "success",
            });
            reload();
        } catch (err) {
            setToast({ message: err.message, type: "error" });
        }
    }

    async function handleReject(course) {
        try {
            await courseService.rejectCourse(course.id);
            setToast({
                message: `"${course.name}" rejected`,
                type: "success",
            });
            reload();
        } catch (err) {
            setToast({ message: err.message, type: "error" });
        }
    }

    async function handleEnroll(course) {
        try {
            await courseService.enroll(course.id, user?.name);
            setToast({
                message: `Successfully enrolled in "${course.name}"!`,
                type: "success",
            });
            reload();
        } catch (err) {
            setToast({ message: err.message, type: "error" });
        }
    }

    return (
        <div className="page">
            <div className="page-header">
                <h1 className="page-title">Courses</h1>
                {canCreateCourse && (
                    <Button
                        size="small"
                        onClick={() => {
                            setEditCourse(null);
                            setFormOpen(true);
                        }}
                    >
                        + New Course
                    </Button>
                )}
            </div>

            <div className="tabs-container">
                <button
                    type="button"
                    className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
                    onClick={() => {
                        setLoading(true);
                        setActiveTab("all");
                        setPage(1);
                    }}
                >
                    {isStudent ? "Available Courses" : "All Courses"}
                </button>

                {isAdmin && (
                    <button
                        type="button"
                        className={`tab-btn ${activeTab === "pending" ? "active" : ""}`}
                        onClick={() => {
                            setLoading(true);
                            setActiveTab("pending");
                            setPage(1);
                        }}
                    >
                        Pending Approval
                    </button>
                )}

                {isInstructor && (
                    <button
                        type="button"
                        className={`tab-btn ${activeTab === "my" ? "active" : ""}`}
                        onClick={() => {
                            setLoading(true);
                            setActiveTab("my");
                            setPage(1);
                        }}
                    >
                        My Courses
                    </button>
                )}

                {isStudent && (
                    <button
                        type="button"
                        className={`tab-btn ${activeTab === "my" ? "active" : ""}`}
                        onClick={() => {
                            setLoading(true);
                            setActiveTab("my");
                            setPage(1);
                        }}
                    >
                        My Enrolled Courses
                        {enrolledCourseIds.length > 0 && (
                            <span className="tab-badge">
                                {enrolledCourseIds.length}
                            </span>
                        )}
                    </button>
                )}
            </div>

            <div className="section-card">
                {activeTab !== "my" && (
                    <SearchBar
                        placeholder="Search courses..."
                        value={search}
                        onChange={(val) => {
                            setLoading(true);
                            setSearch(val);
                            setPage(1);
                        }}
                        onClear={() => {
                            setLoading(true);
                            setSearch("");
                            setPage(1);
                        }}
                    />
                )}

                {loading ? (
                    <div className="table-loading">Loading courses...</div>
                ) : courses.length === 0 ? (
                    <div className="table-loading">
                        {activeTab === "pending"
                            ? "No courses awaiting approval"
                            : activeTab === "my"
                              ? isInstructor
                                  ? "You have not created any courses yet"
                                  : "You have not enrolled in any courses yet"
                              : "No courses found"}
                    </div>
                ) : (
                    <>
                        <CourseTable
                            courses={courses}
                            onEdit={(c) => {
                                setEditCourse(c);
                                setFormOpen(true);
                            }}
                            onDelete={setDeleteCourse}
                            onApprove={handleApprove}
                            onReject={handleReject}
                            onEnroll={handleEnroll}
                            isAdmin={isAdmin}
                            isInstructor={isInstructor}
                            isStudent={isStudent}
                            currentUserEmail={user?.email}
                            enrolledCourseIds={enrolledCourseIds}
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

            <CourseFormModal
                key={editCourse?.id || (formOpen ? "open" : "closed")}
                isOpen={formOpen}
                course={editCourse}
                onClose={() => {
                    setFormOpen(false);
                    setEditCourse(null);
                }}
                onSubmit={handleSaveCourse}
                defaultInstructor={isInstructor ? user?.name : ""}
                isInstructorFixed={isInstructor}
            />

            <ConfirmDialog
                isOpen={Boolean(deleteCourse)}
                title="Delete Course"
                message={`Are you sure you want to delete "${deleteCourse?.name}"?`}
                onClose={() => setDeleteCourse(null)}
                onConfirm={handleDeleteConfirm}
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

export default CoursesPage;
