import { Link, useLocation, useNavigate } from "react-router-dom";
import Badge from "@/components/common/Badge";
import { APP_CONFIG } from "@/constants/config";
import { ROLES } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import "./Header.css";

/**
 * Top navigation header displaying application brand, user info, and role badge.
 */
function Header() {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, user, logout, switchRole } = useAuth();

    function handleLogout() {
        logout();
        navigate(ROUTES.LOGIN);
    }

    async function handleSwitchRole() {
        try {
            await switchRole();
        } catch {
            // Error handled gracefully
        }
    }

    function getRoleBadgeVariant(role) {
        if (!role) return "default";
        const normalized = role.toLowerCase();
        if (normalized === ROLES.ADMIN) return "danger";
        if (normalized === ROLES.INSTRUCTOR) return "primary";
        return "success";
    }

    return (
        <header className="app-header">
            <div className="header-container">
                <Link to={ROUTES.HOME} className="brand-container">
                    <span className="brand-icon">C</span>
                    <span className="brand-title">{APP_CONFIG.APP_TITLE}</span>
                </Link>
                <nav className="header-nav">
                    {isAuthenticated ? (
                        <div className="header-user-nav">
                            <span className="user-greeting">
                                {user?.name || "User"}
                                <Badge
                                    variant={getRoleBadgeVariant(user?.role)}
                                >
                                    {user?.role || ROLES.STUDENT}
                                </Badge>
                            </span>
                            <button
                                type="button"
                                className="nav-btn-switch"
                                onClick={handleSwitchRole}
                                title="Cycle role for testing (Admin -> Instructor -> Student)"
                            >
                                Switch Role
                            </button>
                            <button
                                type="button"
                                className="nav-btn-logout"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link
                                to={ROUTES.LOGIN}
                                className={`nav-link ${location.pathname === ROUTES.LOGIN ? "active" : ""}`}
                            >
                                Login
                            </Link>
                            <Link
                                to={ROUTES.REGISTER}
                                className={`nav-link ${location.pathname === ROUTES.REGISTER ? "active" : ""}`}
                            >
                                Register
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}

export default Header;
