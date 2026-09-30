import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Alert from "@/components/common/Alert";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import Input from "@/components/common/Input";
import { AUTH_MESSAGES } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import {
    INITIAL_REGISTER_FORM,
    REGISTER_FIELDS,
    getRegisterFieldErrors,
    mapRegisterErrors,
    registerSchema,
} from "@/features/auth/registerSchema";
import PasswordRequirements from "@/features/auth/PasswordRequirements";
import { useAuth } from "@/hooks/useAuth";

/** Registration page with real-time inline validation as user types. */
function RegisterPage() {
    const navigate = useNavigate();
    const { register, isAuthenticated } = useAuth();
    const [formData, setFormData] = useState(INITIAL_REGISTER_FORM);
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    function handleChange(event) {
        const { name, value } = event.target;
        const nextData = { ...formData, [name]: value };
        setFormData(nextData);

        const errs = getRegisterFieldErrors(
            name,
            value,
            nextData,
            errors.confirmPassword
        );
        const { error, confirmErr } = errs;
        setErrors((prev) => ({
            ...prev,
            [name]: error,
            confirmPassword: confirmErr,
        }));
        if (serverError) setServerError("");
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setServerError("");
        const result = registerSchema.safeParse(formData);

        if (!result.success) {
            setErrors(mapRegisterErrors(result.error.flatten().fieldErrors));
            return;
        }

        setErrors({});
        setIsSubmitting(true);
        try {
            await register(formData);
            const state = { message: AUTH_MESSAGES.REGISTRATION_SUCCESS };
            navigate(ROUTES.LOGIN, { state });
        } catch (err) {
            setServerError(err.message || "Registration failed");
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isAuthenticated) {
        return <Navigate to={ROUTES.COURSES} replace />;
    }

    return (
        <Card>
            <div className="card-header">
                <h1 className="card-title">Create Account</h1>
                <p className="card-subtitle">Sign up for course enrollment</p>
            </div>
            <Alert>{serverError}</Alert>
            <form onSubmit={handleSubmit} noValidate>
                {REGISTER_FIELDS.map((f) => (
                    <div key={f.id}>
                        <Input
                            {...f}
                            value={formData[f.id]}
                            onChange={handleChange}
                            error={errors[f.id]}
                            disabled={isSubmitting}
                        />
                        {f.id === "password" && (
                            <PasswordRequirements
                                password={formData.password}
                            />
                        )}
                    </div>
                ))}
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Registering..." : "Register"}
                </Button>
            </form>
            <p className="auth-switch">
                Already have an account?{" "}
                <Link to={ROUTES.LOGIN}>Login here</Link>
            </p>
        </Card>
    );
}

export default RegisterPage;
