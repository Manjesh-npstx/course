import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { AUTH_MESSAGES } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import {
    INITIAL_REGISTER_FORM,
    REGISTER_FIELDS,
    getRegisterFieldErrors,
    mapRegisterErrors,
    registerSchema,
} from "@/features/auth/registerSchema";
import { authService } from "@/services/authService";

/** Registration page with real-time inline validation as user types. */
function RegisterPage() {
    const navigate = useNavigate();
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
            await authService.register(formData);
            const state = { message: AUTH_MESSAGES.REGISTRATION_SUCCESS };
            navigate(ROUTES.LOGIN, { state });
        } catch (err) {
            setServerError(err.message || "Registration failed");
        } finally {
            setIsSubmitting(false);
        }
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
