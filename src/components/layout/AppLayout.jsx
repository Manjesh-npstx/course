import { useState } from "react";
import {
    Link,
    NavLink,
    Outlet,
    useLocation,
    useNavigate,
} from "react-router-dom";
import Badge from "@/components/common/Badge";
import { NAV_ITEMS } from "@/constants/navigation";
import { ROLES } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import "./AppLayout.css";

/**
 * Shell layout with fixed/collapsible sidebar, navigation from config,
 * topbar with breadcrumbs, role switcher, and mode banner.
 */
export function AppLayout() {
    const { user, role, isAdmin, isInstructor, isStudent, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate(ROUTES.LOGIN);
    }

    function getRoleBadgeVariant() {
        if (isAdmin) return "warning";
        if (isInstructor) return "primary";
        return "success";
    }

    // Filter nav items based on user's current role
    const currentRole = role || ROLES.STUDENT;
    const allowedNavItems = NAV_ITEMS.filter((item) =>
        item.roles.includes(currentRole)
    );

    // Compute dynamic breadcrumbs from the current location
    function getBreadcrumbs() {
        const { pathname } = location;
        if (pathname.startsWith("/courses/")) {
            return [
                { label: "Dashboard", path: ROUTES.COURSES },
                { label: "Courses", path: ROUTES.COURSES },
                { label: "Course Details", path: pathname },
            ];
        }
        if (pathname === ROUTES.STUDENTS) {
            return [
                { label: "Dashboard", path: ROUTES.COURSES },
                { label: "Students", path: ROUTES.STUDENTS },
            ];
        }
        return [
            { label: "Dashboard", path: ROUTES.COURSES },
            { label: "Courses", path: ROUTES.COURSES },
        ];
    }

    const breadcrumbs = getBreadcrumbs();

    function renderNavIcon(icon) {
        if (icon === "users") {
            return (
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
            );
        }
        return (
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
        );
    }

    return (
        <div className="app-layout">
            {/* Mobile backdrop */}
            {sidebarOpen && (
                <div
                    className="sidebar-backdrop"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar navigation */}
            <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
                <div className="sidebar-header">
                    <div className="sidebar-brand">
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
                    <button
                        type="button"
                        className="sidebar-close-btn"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Close sidebar"
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
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {allowedNavItems.map((item) => (
                        <NavLink
                            key={item.id}
                            to={item.path}
                            className={({ isActive }) =>
                                `sidebar-link ${isActive ? "active" : ""}`
                            }
                            onClick={() => setSidebarOpen(false)}
                        >
                            {renderNavIcon(item.icon)}
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
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
                    </div>
                </div>
            </aside>

            {/* Main content wrapper with sticky topbar */}
            <div className="app-main-wrapper">
                <header className="app-topbar">
                    <div className="topbar-left">
                        <button
                            type="button"
                            className="sidebar-toggle-btn"
                            onClick={() => setSidebarOpen((prev) => !prev)}
                            aria-label="Toggle navigation menu"
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line x1="3" y1="12" x2="21" y2="12" />
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <line x1="3" y1="18" x2="21" y2="18" />
                            </svg>
                        </button>
                        <nav className="breadcrumbs" aria-label="Breadcrumb">
                            {breadcrumbs.map((crumb, idx) => (
                                <span
                                    key={crumb.path + idx}
                                    className="breadcrumb-item"
                                >
                                    {idx > 0 && (
                                        <span className="breadcrumb-separator">
                                            /
                                        </span>
                                    )}
                                    {idx === breadcrumbs.length - 1 ? (
                                        <span className="breadcrumb-current">
                                            {crumb.label}
                                        </span>
                                    ) : (
                                        <Link
                                            to={crumb.path}
                                            className="breadcrumb-link"
                                        >
                                            {crumb.label}
                                        </Link>
                                    )}
                                </span>
                            ))}
                        </nav>
                    </div>

                    <div className="topbar-right">
                        <span className="topbar-user-greeting">
                            Signed in as <strong>{user?.name || "User"}</strong>
                        </span>
                        <Badge variant={getRoleBadgeVariant()}>
                            {role || "Student"}
                        </Badge>
                    </div>
                </header>

                <main className="main-content">
                    {isStudent && (
                        <div className="mode-banner mode-banner-student">
                            <span>
                                ℹ️ <strong>Student Mode:</strong> You can browse
                                approved courses, self-enroll in courses, and
                                view your enrollments in &quot;My Courses&quot;.
                            </span>
                        </div>
                    )}
                    {isInstructor && (
                        <div className="mode-banner mode-banner-instructor">
                            <span>
                                🎓 <strong>Instructor Mode:</strong> You can
                                create courses (sent for Admin approval), manage
                                your created courses in &quot;My Courses&quot;,
                                and view enrolled students.
                            </span>
                        </div>
                    )}
                    {isAdmin && (
                        <div className="mode-banner mode-banner-admin">
                            <span>
                                👑 <strong>Admin Mode:</strong> You have full
                                administrator access to approve/reject pending
                                courses, manage all courses, and enroll
                                students.
                            </span>
                        </div>
                    )}
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default AppLayout;
