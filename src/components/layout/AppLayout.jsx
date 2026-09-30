import { NavLink, Outlet, useNavigate } from "react-router-dom";
import Badge from "@/components/common/Badge";
import { ROLES } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import "./AppLayout.css";

/**
 * Shell layout with fixed sidebar, navigation, role switcher, and mode banner.
 */
export function AppLayout() {
    const { user, role, isAdmin, isInstructor, isStudent, switchRole, logout } =
        useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate(ROUTES.LOGIN);
    }

    async function handleRoleSelect(targetRole) {
        try {
            await switchRole(targetRole);
        } catch {
            // Handled gracefully
        }
    }

    function getRoleBadgeVariant() {
        if (isAdmin) return "warning";
        if (isInstructor) return "primary";
        return "success";
    }

    return (
        <div className="app-layout">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                        </svg>
                    </div>
                    <h1 className="sidebar-title">Course Enrollment</h1>
                </div>

                <nav className="sidebar-nav">
                    <NavLink
                        to={ROUTES.COURSES}
                        className={({ isActive }) =>
                            `sidebar-link ${isActive ? "active" : ""}`
                        }
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                        </svg>
                        <span>Courses</span>
                    </NavLink>
                    <NavLink
                        to={ROUTES.STUDENTS}
                        className={({ isActive }) =>
                            `sidebar-link ${isActive ? "active" : ""}`
                        }
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        <span>Students</span>
                    </NavLink>
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="sidebar-user-top">
                            <div>
                                <span className="sidebar-user-name">
                                    {user?.name || "User"}
                                </span>
                                <Badge variant={getRoleBadgeVariant()}>
                                    {role || "Student"}
                                </Badge>
                            </div>
                            <button
                                type="button"
                                className="sidebar-btn-logout"
                                onClick={handleLogout}
                                title="Sign out"
                            >
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                    <polyline points="16 17 21 12 16 7" />
                                    <line x1="21" y1="12" x2="9" y2="12" />
                                </svg>
                            </button>
                        </div>

                        <div className="sidebar-role-switch">
                            <div className="sidebar-role-switch-title">
                                Switch Role (Demo)
                            </div>
                            <div className="sidebar-role-buttons">
                                <button
                                    type="button"
                                    className={`role-switch-btn ${isAdmin ? "active" : ""}`}
                                    onClick={() =>
                                        handleRoleSelect(ROLES.ADMIN)
                                    }
                                >
                                    Admin
                                </button>
                                <button
                                    type="button"
                                    className={`role-switch-btn ${isInstructor ? "active" : ""}`}
                                    onClick={() =>
                                        handleRoleSelect(ROLES.INSTRUCTOR)
                                    }
                                >
                                    Instructor
                                </button>
                                <button
                                    type="button"
                                    className={`role-switch-btn ${isStudent ? "active" : ""}`}
                                    onClick={() =>
                                        handleRoleSelect(ROLES.STUDENT)
                                    }
                                >
                                    Student
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="main-content">
                {isStudent && (
                    <div className="mode-banner mode-banner-student">
                        <span>
                            ℹ️ <strong>Student Mode:</strong> You can browse
                            approved courses, self-enroll in courses, and view
                            your enrollments in &quot;My Courses&quot;.
                        </span>
                    </div>
                )}
                {isInstructor && (
                    <div className="mode-banner mode-banner-instructor">
                        <span>
                            🎓 <strong>Instructor Mode:</strong> You can create
                            courses (sent for Admin approval), manage your
                            created courses in &quot;My Courses&quot;, and view
                            enrolled students.
                        </span>
                    </div>
                )}
                {isAdmin && (
                    <div className="mode-banner mode-banner-admin">
                        <span>
                            👑 <strong>Admin Mode:</strong> You have full
                            administrator access to approve/reject pending
                            courses, manage all courses, and enroll students.
                        </span>
                    </div>
                )}
                <Outlet />
            </main>
        </div>
    );
}

export default AppLayout;
