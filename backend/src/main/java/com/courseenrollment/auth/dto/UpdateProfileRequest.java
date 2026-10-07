package com.courseenrollment.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;

public class UpdateProfileRequest {

    @Schema(example = "John Doe")
    @Size(max = 255, message = "Name must be shorter than or equal to 255 characters")
    private String name;

    @Schema(example = "9876543210")
    @Size(max = 50, message = "Phone must be shorter than or equal to 50 characters")
    private String phone;

    public UpdateProfileRequest() {
    }

    public UpdateProfileRequest(String name, String phone) {
        this.name = name;
        this.phone = phone;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}
