import { Link, useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { ROUTES } from "@/constants/routes";
import { authService } from "@/services/authService";
import { tokenStorage } from "@/services/tokenStorage";

/**
 * Home landing and authenticated dashboard summary page.
 */
function HomePage() {
    const navigate = useNavigate();
    const user = tokenStorage.getUser();
    const isAuthenticated = tokenStorage.hasToken();

    function handleLogout() {
        authService.logout();
        navigate(ROUTES.LOGIN);
    }

    if (!isAuthenticated) {
        return (
            <Card>
                <div className="card-header">
                    <h1 className="card-title">Course Enrollment</h1>
                    <p className="card-subtitle">
                        Discover courses and enhance your learning journey
                    </p>
                </div>
                <p className="card-description">
                    Welcome to the Course Enrollment Portal. Please sign in or
                    create an account to get started.
                </p>
                <div className="card-actions">
                    <Link to={ROUTES.LOGIN}>
                        <Button fullWidth>Login</Button>
                    </Link>
                    <Link to={ROUTES.REGISTER}>
                        <Button variant="secondary" fullWidth>
                            Register
                        </Button>
                    </Link>
                </div>
            </Card>
        );
    }

    return (
        <Card>
            <div className="card-header">
                <h1 className="card-title">
                    Welcome, {user?.name || "Student"}!
                </h1>
                <p className="card-subtitle">
                    {user?.email} &bull; {user?.role || "STUDENT"}
                </p>
            </div>
            <p className="card-description">
                You are securely logged into your course enrollment account.
            </p>
            <div className="card-actions">
                <Button variant="secondary" fullWidth onClick={handleLogout}>
                    Logout
                </Button>
            </div>
        </Card>
    );
}

export default HomePage;
