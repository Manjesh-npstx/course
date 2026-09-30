import { useEffect, useState } from "react";
import Button from "@/components/common/Button";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import Pagination from "@/components/common/Pagination";
import SearchBar from "@/components/common/SearchBar";
import Toast from "@/components/common/Toast";
import EditStudentModal from "@/features/students/EditStudentModal";
import EnrollStudentModal from "@/features/students/EnrollStudentModal";
import StudentTable from "@/features/students/StudentTable";
import { useAuth } from "@/hooks/useAuth";
import { courseService } from "@/services/courseService";
import { studentService } from "@/services/studentService";
import "./CoursesPage.css";

/**
 * Students management page providing search, table listing, and enrollment modals.
 */
export function StudentsPage() {
    const { isAdmin } = useAuth();
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const [enrollOpen, setEnrollOpen] = useState(false);
    const [editStudent, setEditStudent] = useState(null);
    const [deleteStudent, setDeleteStudent] = useState(null);
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

    // Fetch students list
    useEffect(() => {
        let isMounted = true;
        async function fetchStudents() {
            try {
                const res = await studentService.getStudents({
                    page,
                    limit: 10,
                    search,
                });
                if (isMounted) {
                    setStudents(res.data || []);
                    setTotalPages(res.meta?.totalPages || 1);
                    setTotal(res.meta?.total || 0);
                    setLoading(false);
                }
            } catch {
                if (isMounted) {
                    setToast({
                        message: "Failed to load students",
                        type: "error",
                    });
                    setLoading(false);
                }
            }
        }
        fetchStudents();
        return () => {
            isMounted = false;
        };
    }, [page, search, refreshIndex]);

    function reload() {
        setLoading(true);
        setRefreshIndex((prev) => prev + 1);
    }

    async function handleEnroll(data) {
        await studentService.enrollStudent(data);
        setToast({
            message: "Student enrolled successfully",
            type: "success",
        });
        reload();
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

    return (
        <div className="page">
            <div className="page-header">
                <h1 className="page-title">Students</h1>
                {isAdmin && (
                    <Button size="small" onClick={() => setEnrollOpen(true)}>
                        + Enroll Student
                    </Button>
                )}
            </div>

            <div className="section-card">
                <SearchBar
                    placeholder="Search by name or email..."
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
                    <div className="table-loading">Loading students...</div>
                ) : students.length === 0 ? (
                    <div className="table-loading">No students found</div>
                ) : (
                    <>
                        <StudentTable
                            students={students}
                            showCourse
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
                onSubmit={handleEnroll}
                courses={courses}
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
                message={`Are you sure you want to remove "${deleteStudent?.name}" from this course?`}
                onClose={() => setDeleteStudent(null)}
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

export default StudentsPage;
