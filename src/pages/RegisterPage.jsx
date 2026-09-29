import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { ROUTES } from "@/constants/routes";
import {
    mapRegisterErrors,
    registerSchema,
    validateRegisterField,
} from "@/features/auth/registerSchema";

const INITIAL_FORM = { name: "", email: "", password: "", confirmPassword: "" };

const REGISTER_FIELDS = [
    { id: "name", label: "Full Name", type: "text" },
    { id: "email", label: "Email", type: "email" },
    { id: "password", label: "Password", type: "password" },
    { id: "confirmPassword", label: "Confirm Password", type: "password" },
];

/** Registration page with real-time inline validation as user types. */
function RegisterPage() {
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    function handleChange(event) {
        const { name, value } = event.target;
        const nextData = { ...formData, [name]: value };
        setFormData(nextData);

        const error = validateRegisterField(name, value, nextData);
        const confirmErr =
            name === "password" && nextData.confirmPassword
                ? validateRegisterField(
                      "confirmPassword",
                      nextData.confirmPassword,
                      nextData
                  )
                : errors.confirmPassword;

        setErrors((prev) => ({
            ...prev,
            [name]: error,
            confirmPassword: confirmErr,
        }));
    }

    function handleSubmit(event) {
        event.preventDefault();
        const result = registerSchema.safeParse(formData);

        if (!result.success) {
            setErrors(mapRegisterErrors(result.error.flatten().fieldErrors));
            return;
        }

        setErrors({});
        setIsSubmitting(true);
        setTimeout(() => setIsSubmitting(false), 500);
    }

    return (
        <Card>
            <div className="card-header">
                <h1 className="card-title">Create Account</h1>
                <p className="card-subtitle">
                    Get started with course enrollment today
                </p>
            </div>
            <form onSubmit={handleSubmit} noValidate>
                {REGISTER_FIELDS.map((field) => (
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
