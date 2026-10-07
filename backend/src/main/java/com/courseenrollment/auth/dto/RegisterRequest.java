package com.courseenrollment.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class RegisterRequest {

    @Schema(example = "John Doe")
    @NotBlank(message = "name should not be empty")
    @Size(max = 255, message = "name must be shorter than or equal to 255 characters")
    private String name;

    @Schema(example = "john@example.com")
    @NotBlank(message = "email should not be empty")
    @Email(message = "email must be an email")
    private String email;

    @Schema(example = "9876543210")
    @NotBlank(message = "Mobile number is required")
    @Pattern(regexp = "^[+]?[0-9\\s\\-().]{7,20}$", message = "Invalid mobile number format")
    private String phone;

    @Schema(example = "Pass@1234", minLength = 8)
    @NotBlank(message = "password should not be empty")
    @Size(min = 8, message = "password must be at least 8 characters")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$",
        message = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    )
    private String password;

    @Schema(example = "student")
    private String role;

    public RegisterRequest() {
    }

    public RegisterRequest(String name, String email, String password) {
        this(name, email, password, null, "9876543210");
    }

    public RegisterRequest(String name, String email, String password, String role) {
        this(name, email, password, role, "9876543210");
    }

    public RegisterRequest(String name, String email, String password, String role, String phone) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.phone = phone;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
