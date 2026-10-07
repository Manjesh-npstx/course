import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Alert from "@/components/common/Alert";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import Input from "@/components/common/Input";
import { AUTH_MESSAGES } from "@/constants/messages";
import { ROUTES } from "@/constants/routes";
import PasswordRequirements from "@/features/auth/PasswordRequirements";
import {
    INITIAL_RESET_PASSWORD_FORM,
    RESET_PASSWORD_FIELDS,
    mapResetPasswordErrors,
    resetPasswordSchema,
    validateResetPasswordField,
} from "@/features/auth/resetPasswordSchema";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/authService";

/**
 * Self-service password reset page verifying registered email and phone number.
 */
function ResetPasswordPage() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [formData, setFormData] = useState(INITIAL_RESET_PASSWORD_FORM);
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    function handleChange(event) {
        const { name, value } = event.target;
        const nextData = { ...formData, [name]: value };
        setFormData(nextData);

        const error = validateResetPasswordField(name, value, nextData);
        setErrors((prev) => ({
            ...prev,
            [name]: error,
            ...(name === "newPassword" && nextData.confirmPassword
                ? {
                      confirmPassword: validateResetPasswordField(
                          "confirmPassword",
                          nextData.confirmPassword,
                          nextData
                      ),
                  }
                : {}),
        }));

        if (serverError) setServerError("");
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setServerError("");

        const result = resetPasswordSchema.safeParse(formData);
        if (!result.success) {
            setErrors(mapResetPasswordErrors(result.error.flatten().fieldErrors));
            return;
        }

        setErrors({});
        setIsSubmitting(true);

        try {
            await authService.resetPassword({
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                newPassword: formData.newPassword,
            });
            navigate(ROUTES.LOGIN, {
                state: { message: AUTH_MESSAGES.RESET_PASSWORD_SUCCESS },
            });
        } catch (err) {
            setServerError(err.message || "Failed to reset password. Please check your details.");
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
                <h1 className="card-title">Reset Password</h1>
                <p className="card-subtitle">
                    Verify your registered email and mobile number to set a new password
                </p>
            </div>

            <Alert>{serverError}</Alert>

            <form onSubmit={handleSubmit} noValidate>
                {RESET_PASSWORD_FIELDS.map((f) => (
                    <div key={f.id}>
                        <Input
                            {...f}
                            value={formData[f.id]}
                            onChange={handleChange}
                            error={errors[f.id]}
                            disabled={isSubmitting}
                        />
                        {f.id === "newPassword" && (
                            <PasswordRequirements
                                password={formData.newPassword}
                            />
                        )}
                    </div>
                ))}

                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Resetting Password..." : "Reset Password"}
                </Button>
            </form>

            <p className="auth-switch">
                Remember your password?{" "}
                <Link to={ROUTES.LOGIN}>Back to Login</Link>
            </p>
        </Card>
    );
}

export default ResetPasswordPage;
