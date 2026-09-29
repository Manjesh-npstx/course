import { Link, useLocation, useNavigate } from "react-router-dom";
import { APP_CONFIG } from "@/constants/config";
import { ROUTES } from "@/constants/routes";
import { authService } from "@/services/authService";
import { tokenStorage } from "@/services/tokenStorage";
import "./Header.css";

/**
 * Top navigation header displaying application brand and authentication state.
 */
function Header() {
    const location = useLocation();
    const navigate = useNavigate();
    const isAuthenticated = tokenStorage.hasToken();
    const user = tokenStorage.getUser();

    function handleLogout() {
        authService.logout();
        navigate(ROUTES.LOGIN);
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
                                {user?.name || "Student"}
                            </span>
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
