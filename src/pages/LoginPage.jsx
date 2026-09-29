import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { AUTH_MESSAGES } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import {
    LOGIN_FIELDS,
    loginSchema,
    mapLoginErrors,
    validateLoginField,
} from "@/features/auth/loginSchema";
import { authService } from "@/services/authService";

/** Login page with real-time inline validation as user types. */
function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const successMessage = location.state?.message || "";

    function handleChange(event) {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        const error = validateLoginField(name, value);
        setErrors((prev) => ({ ...prev, [name]: error }));
        if (serverError) setServerError("");
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setServerError("");
        const result = loginSchema.safeParse(formData);

        if (!result.success) {
            setErrors(mapLoginErrors(result.error.flatten().fieldErrors));
            return;
        }

        setErrors({});
        setIsSubmitting(true);
        try {
            await authService.login(formData);
            navigate(ROUTES.HOME);
        } catch (err) {
            setServerError(err.message || AUTH_MESSAGES.GENERIC_LOGIN_ERROR);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Card>
            <div className="card-header">
                <h1 className="card-title">Welcome Back</h1>
                <p className="card-subtitle">
                    Sign in to your course enrollment portal
                </p>
            </div>
            <Alert type="success">{successMessage}</Alert>
            <Alert>{serverError}</Alert>
            <form onSubmit={handleSubmit} noValidate>
                {LOGIN_FIELDS.map((f) => (
                    <Input
                        key={f.id}
                        {...f}
                        value={formData[f.id]}
                        onChange={handleChange}
                        error={errors[f.id]}
                        disabled={isSubmitting}
                    />
                ))}
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Logging in..." : "Login"}
                </Button>
            </form>
            <p className="auth-switch">
                Don&apos;t have an account?{" "}
                <Link to={ROUTES.REGISTER}>Register here</Link>
            </p>
        </Card>
    );
}

export default LoginPage;
