package com.courseenrollment.course.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateCourseRequest {

    @Schema(example = "React 101")
    @NotBlank(message = "name should not be empty")
    @Size(max = 255, message = "name must be shorter than or equal to 255 characters")
    private String name;

    @Schema(example = "Jane Smith")
    @NotBlank(message = "instructor should not be empty")
    @Size(max = 255, message = "instructor must be shorter than or equal to 255 characters")
    private String instructor;

    @Schema(example = "30", minimum = "1")
    @NotNull(message = "seatLimit should not be empty")
    @Min(value = 1, message = "seatLimit must not be less than 1")
    private Integer seatLimit;

    @Schema(example = "instructor1@campus.com")
    private String instructorEmail;

    public CreateCourseRequest() {
    }

    public CreateCourseRequest(String name, String instructor, Integer seatLimit) {
        this(name, instructor, seatLimit, null);
    }

    public CreateCourseRequest(String name, String instructor, Integer seatLimit, String instructorEmail) {
        this.name = name;
        this.instructor = instructor;
        this.seatLimit = seatLimit;
        this.instructorEmail = instructorEmail;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getInstructor() {
        return instructor;
    }

    public void setInstructor(String instructor) {
        this.instructor = instructor;
    }

    public Integer getSeatLimit() {
        return seatLimit;
    }

    public void setSeatLimit(Integer seatLimit) {
        this.seatLimit = seatLimit;
    }

    public String getInstructorEmail() {
        return instructorEmail;
    }

    public void setInstructorEmail(String instructorEmail) {
        this.instructorEmail = instructorEmail;
    }
}
