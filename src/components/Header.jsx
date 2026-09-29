import { Link, useLocation } from "react-router-dom";
import { APP_CONFIG } from "@/constants/config";
import { ROUTES } from "@/constants/routes";
import "./Header.css";

/**
 * Top navigation header displaying the application brand and auth route pills.
 *
 * @returns {JSX.Element}
 */
function Header() {
    const location = useLocation();

    return (
        <header className="app-header">
            <div className="header-container">
                <Link to={ROUTES.HOME} className="brand-container">
                    <span className="brand-icon">C</span>
                    <span className="brand-title">{APP_CONFIG.APP_TITLE}</span>
                </Link>
                <nav className="header-nav">
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
                </nav>
            </div>
        </header>
    );
}

export default Header;
