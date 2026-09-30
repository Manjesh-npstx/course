import { Navigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import Alert from "@/components/common/Alert";
import Card from "@/components/common/Card";
import { AUTH_MESSAGES } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import { hasRole } from "@/utils/permissions";

/**
 * Route wrapper that enforces authentication and optional role restrictions.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string[]} [props.allowedRoles]
 * @returns {JSX.Element}
 */
export function ProtectedRoute({ children, allowedRoles }) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <Card>
                <p className="card-description">Verifying credentials...</p>
            </Card>
        );
    }

    if (!isAuthenticated) {
        return (
            <Navigate
                to={ROUTES.LOGIN}
                state={{ from: location.pathname }}
                replace
            />
        );
    }

    if (
        Array.isArray(allowedRoles) &&
        allowedRoles.length > 0 &&
        !hasRole(user, allowedRoles)
    ) {
        return (
            <Card>
                <div className="card-header">
                    <h1 className="card-title">Access Denied</h1>
                    <p className="card-subtitle">
                        Role required: {allowedRoles.join(" or ")}
                    </p>
                </div>
                <Alert>{AUTH_MESSAGES.UNAUTHORIZED}</Alert>
                <p className="card-description">
                    Your current account ({user?.role}) does not have permission
                    to view this page.
                </p>
            </Card>
        );
    }

    return children;
}

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
    allowedRoles: PropTypes.arrayOf(PropTypes.string),
};

export default ProtectedRoute;
