import { useEffect, useState } from "react";
import Button from "@/components/common/Button";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import Pagination from "@/components/common/Pagination";
import SearchBar from "@/components/common/SearchBar";
import Toast from "@/components/common/Toast";
import EditStudentModal from "@/features/students/EditStudentModal";
import EnrollStudentModal from "@/features/students/EnrollStudentModal";
import StudentTable from "@/features/students/StudentTable";
import UserDirectoryTable from "@/features/students/UserDirectoryTable";
import { useAuth } from "@/hooks/useAuth";
import { courseService } from "@/services/courseService";
import { studentService } from "@/services/studentService";
import { userService } from "@/services/userService";
import "./CoursesPage.css";

/**
 * Students management and user directory page.
 * Admins can browse registered students (unique per person with enrolled courses),
 * instructors, and enrollment records, as well as enable/disable accounts.
 * Instructors see students enrolled in their courses.
 */
export function StudentsPage() {
    const { user, isAdmin } = useAuth();
    const [activeTab, setActiveTab] = useState(
        isAdmin ? "students" : "enrollments"
    );
    const [items, setItems] = useState([]);
    const [courses, setCourses] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const [enrollOpen, setEnrollOpen] = useState(false);
    const [enrollStudent, setEnrollStudent] = useState(null);
    const [editStudent, setEditStudent] = useState(null);
    const [deleteStudent, setDeleteStudent] = useState(null);
    const [statusUser, setStatusUser] = useState(null);
    const [toast, setToast] = useState(null);
    const [refreshIndex, setRefreshIndex] = useState(0);

    // Fetch courses for the enrollment course dropdown
    useEffect(() => {
        let isMounted = true;
        async function fetchCourses() {
            try {
                const res = await courseService.getCourses({
                    page: 1,
                    limit: 100,
                });
                if (isMounted) {
                    setCourses(res.data || []);
                }
            } catch {
                // Ignore background fetch error
            }
        }
        fetchCourses();
        return () => {
            isMounted = false;
        };
    }, []);

    // Fetch tab data (registered students, instructors, or course enrollments)
    useEffect(() => {
        let isMounted = true;
        async function fetchData() {
            try {
                let res;
                if (activeTab === "students") {
                    res = await userService.getUsers({
                        page,
                        limit: 10,
                        role: "STUDENT",
                        search,
                    });
                } else if (activeTab === "instructors") {
                    res = await userService.getUsers({
                        page,
                        limit: 10,
                        role: "INSTRUCTOR",
                        search,
                    });
                } else {
                    res = await studentService.getStudents({
                        page,
                        limit: 10,
                        search,
                    });
                }

                if (isMounted) {
                    setItems(res.data || []);
                    setTotalPages(res.meta?.totalPages || 1);
                    setTotal(res.meta?.total || 0);
                    setLoading(false);
                }
            } catch {
                if (isMounted) {
                    setToast({
                        message: "Failed to load data",
                        type: "error",
                    });
                    setLoading(false);
                }
            }
        }

        fetchData();
        return () => {
            isMounted = false;
        };
    }, [activeTab, page, search, refreshIndex]);

    function reload() {
        setLoading(true);
        setRefreshIndex((prev) => prev + 1);
    }

    function handleTabChange(tab) {
        if (tab === activeTab) return;
        setActiveTab(tab);
        setPage(1);
        setSearch("");
        setLoading(true);
    }

    async function handleEnrollSubmit(data) {
        await studentService.enrollStudent(data);
        setToast({
            message: "Student enrolled successfully",
            type: "success",
        });
        setEnrollStudent(null);
        reload();
    }

    function handleOpenEnrollForStudent(student) {
        setEnrollStudent(student);
        setEnrollOpen(true);
    }

    async function handleToggleStatusConfirm() {
        if (!statusUser) return;
        const targetStatus =
            (statusUser.status || "").toLowerCase() === "active"
                ? "disabled"
                : "active";
        try {
            await userService.updateStatus(statusUser.id, targetStatus);
            setToast({
                message: `Account for ${statusUser.name} has been ${targetStatus === "active" ? "enabled" : "disabled"}.`,
                type: "success",
            });
            setStatusUser(null);
            reload();
        } catch (err) {
            setToast({
                message: err.message || "Failed to update account status",
                type: "error",
            });
        }
    }

    async function handleEdit(data) {
        if (!editStudent) return;
        await studentService.updateStudent(editStudent.id, data);
        setToast({
            message: "Student updated successfully",
            type: "success",
        });
        setEditStudent(null);
        reload();
    }

    async function handleDeleteConfirm() {
        if (!deleteStudent) return;
        try {
            await studentService.deleteStudent(deleteStudent.id);
            setToast({
                message: "Student removed from course successfully",
                type: "success",
            });
            setDeleteStudent(null);
            reload();
        } catch (err) {
            setToast({
                message: err.message || "Failed to remove student",
                type: "error",
            });
        }
    }

    return (
        <div className="page">
            <div className="page-header">
                <h1 className="page-title">
                    {isAdmin
                        ? "Students & Users Directory"
                        : "Enrolled Students"}
                </h1>
                {isAdmin && (
                    <Button
                        size="small"
                        onClick={() => {
                            setEnrollStudent(null);
                            setEnrollOpen(true);
                        }}
                    >
                        + Enroll Student
                    </Button>
                )}
            </div>

            {isAdmin && (
                <div className="tabs-container">
                    <button
                        type="button"
                        className={`tab-btn ${activeTab === "students" ? "active" : ""}`}
                        onClick={() => handleTabChange("students")}
                    >
                        Registered Students
                        {activeTab === "students" && total > 0 && (
                            <span className="tab-badge">{total}</span>
                        )}
                    </button>
                    <button
                        type="button"
                        className={`tab-btn ${activeTab === "instructors" ? "active" : ""}`}
                        onClick={() => handleTabChange("instructors")}
                    >
                        Instructors
                        {activeTab === "instructors" && total > 0 && (
                            <span className="tab-badge">{total}</span>
                        )}
                    </button>
                    <button
                        type="button"
                        className={`tab-btn ${activeTab === "enrollments" ? "active" : ""}`}
                        onClick={() => handleTabChange("enrollments")}
                    >
                        Course Enrollments
                        {activeTab === "enrollments" && total > 0 && (
                            <span className="tab-badge">{total}</span>
                        )}
                    </button>
                </div>
            )}

            <div className="section-card">
                <SearchBar
                    placeholder={
                        activeTab === "instructors"
                            ? "Search instructors by name or email..."
                            : "Search students by name or email..."
                    }
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

                {loading ? (
                    <div className="table-loading">Loading records...</div>
                ) : items.length === 0 ? (
                    <div className="table-loading">No records found</div>
                ) : (
                    <>
                        {activeTab === "students" && (
                            <UserDirectoryTable
                                users={items}
                                onToggleStatus={setStatusUser}
                                onEnroll={handleOpenEnrollForStudent}
                                currentUserEmail={user?.email}
                                showCourses={true}
                            />
                        )}

                        {activeTab === "instructors" && (
                            <UserDirectoryTable
                                users={items}
                                onToggleStatus={setStatusUser}
                                currentUserEmail={user?.email}
                                showCourses={false}
                            />
                        )}

                        {activeTab === "enrollments" && (
                            <StudentTable
                                students={items}
                                showCourse
                                onEdit={isAdmin ? setEditStudent : undefined}
                                onDelete={
                                    isAdmin ? setDeleteStudent : undefined
                                }
                                isAdmin={isAdmin}
                            />
                        )}

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
                onClose={() => {
                    setEnrollOpen(false);
                    setEnrollStudent(null);
                }}
                onSubmit={handleEnrollSubmit}
                courses={courses}
                preselectedStudent={enrollStudent}
            />

            <EditStudentModal
                key={editStudent?.id || "none"}
                isOpen={Boolean(editStudent)}
                student={editStudent}
                courses={courses}
                onClose={() => setEditStudent(null)}
                onSubmit={handleEdit}
            />

            <ConfirmDialog
                isOpen={Boolean(deleteStudent)}
                title="Remove Student"
                message={`Are you sure you want to remove "${deleteStudent?.name}" from "${deleteStudent?.course?.name || "this course"}"?`}
                onClose={() => setDeleteStudent(null)}
                onConfirm={handleDeleteConfirm}
            />

            <ConfirmDialog
                isOpen={Boolean(statusUser)}
                title={
                    (statusUser?.status || "").toLowerCase() === "active"
                        ? "Disable User Account"
                        : "Enable User Account"
                }
                message={
                    (statusUser?.status || "").toLowerCase() === "active"
                        ? `Are you sure you want to disable "${statusUser?.name}" (${statusUser?.email})? They will be blocked from logging in until re-enabled.`
                        : `Are you sure you want to enable "${statusUser?.name}" (${statusUser?.email})? They will be able to log in again.`
                }
                confirmLabel={
                    (statusUser?.status || "").toLowerCase() === "active"
                        ? "Disable Account"
                        : "Enable Account"
                }
                onClose={() => setStatusUser(null)}
                onConfirm={handleToggleStatusConfirm}
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

export default StudentsPage;
