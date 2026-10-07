package com.courseenrollment.auth.dto;

import com.courseenrollment.auth.enums.UserRole;
import com.courseenrollment.auth.enums.UserStatus;

public class UserDto {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String role;
    private String status;
    private java.util.List<String> enrolledCourses;

    public UserDto() {
    }

    public UserDto(Long id, String name, String email, String role) {
        this(id, name, email, role, UserStatus.ACTIVE.getValue(), null);
    }

    public UserDto(Long id, String name, String email, String role, String status) {
        this(id, name, email, role, status, null);
    }

    public UserDto(Long id, String name, String email, String role, String status, String phone) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.status = status;
        this.phone = phone;
    }

    public static UserDto fromEntity(com.courseenrollment.auth.entity.User user) {
        return new UserDto(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole() != null ? user.getRole().getValue() : UserRole.STUDENT.getValue(),
                user.getStatus() != null ? user.getStatus().getValue() : UserStatus.ACTIVE.getValue(),
                user.getPhone()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public java.util.List<String> getEnrolledCourses() {
        return enrolledCourses;
    }

    public void setEnrolledCourses(java.util.List<String> enrolledCourses) {
        this.enrolledCourses = enrolledCourses;
    }
}
