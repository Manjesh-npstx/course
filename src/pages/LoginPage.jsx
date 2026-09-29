import { useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { loginSchema } from "@/features/auth/loginSchema";

function LoginPage() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [errors, setErrors] = useState({});

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((currentData) => ({
            ...currentData,
            [name]: value,
        }));
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
    }

    return (
        <Card>
            <h2>Login</h2>

            <form onSubmit={handleSubmit}>
                <Input
                    id="email"
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                />

                <Input
                    id="password"
                    label="Password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                />

                <Button type="submit">Login</Button>
            </form>
        </Card>
    );
}

export default LoginPage;