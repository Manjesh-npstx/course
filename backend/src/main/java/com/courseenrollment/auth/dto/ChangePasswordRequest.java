package com.courseenrollment.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class ChangePasswordRequest {

    @Schema(example = "OldPass@123")
    private String oldPassword;

    @Schema(example = "OldPass@123")
    private String currentPassword;

    @Schema(example = "NewPass@1234", minLength = 8)
    @NotBlank(message = "New password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$",
        message = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    )
    private String newPassword;

    public ChangePasswordRequest() {
    }

    public ChangePasswordRequest(String oldPassword, String newPassword) {
        this.oldPassword = oldPassword;
        this.currentPassword = oldPassword;
        this.newPassword = newPassword;
    }

    public String getOldPassword() {
        if (oldPassword != null && !oldPassword.trim().isEmpty()) {
            return oldPassword;
        }
        return currentPassword;
    }

    public void setOldPassword(String oldPassword) {
        this.oldPassword = oldPassword;
        if (this.currentPassword == null) {
            this.currentPassword = oldPassword;
        }
    }

    public String getCurrentPassword() {
        if (currentPassword != null && !currentPassword.trim().isEmpty()) {
            return currentPassword;
        }
        return oldPassword;
    }

    public void setCurrentPassword(String currentPassword) {
        this.currentPassword = currentPassword;
        if (this.oldPassword == null) {
            this.oldPassword = currentPassword;
        }
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
