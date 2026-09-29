import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { ROUTES } from "@/constants/routes";
import { loginSchema, validateLoginField } from "@/features/auth/loginSchema";

const LOGIN_FIELDS = [
    { id: "email", label: "Email", type: "email" },
    { id: "password", label: "Password", type: "password" },
];

/** Login page with real-time inline validation as user types. */
function LoginPage() {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    function handleChange(event) {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        const error = validateLoginField(name, value);
        setErrors((prev) => ({ ...prev, [name]: error }));
    }

    function handleSubmit(event) {
        event.preventDefault();
        const result = loginSchema.safeParse(formData);

        if (!result.success) {
            const fieldErrors = result.error.flatten().fieldErrors;
            setErrors({
                email: fieldErrors.email?.[0] || "",
                password: fieldErrors.password?.[0] || "",
            });
            return;
        }

        setErrors({});
        setIsSubmitting(true);
        setTimeout(() => setIsSubmitting(false), 500);
    }

    return (
        <Card>
            <div className="card-header">
                <h1 className="card-title">Welcome Back</h1>
                <p className="card-subtitle">
                    Sign in to your course enrollment portal
                </p>
            </div>
            <form onSubmit={handleSubmit} noValidate>
                {LOGIN_FIELDS.map((field) => (
                    <Input
                        key={field.id}
                        id={field.id}
                        label={field.label}
                        type={field.type}
                        name={field.id}
                        value={formData[field.id]}
                        onChange={handleChange}
                        error={errors[field.id]}
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
