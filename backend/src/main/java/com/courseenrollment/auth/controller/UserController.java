package com.courseenrollment.auth.controller;

import com.courseenrollment.auth.dto.UserDto;
import com.courseenrollment.auth.enums.UserStatus;
import com.courseenrollment.auth.service.UserService;
import com.courseenrollment.common.dto.PaginatedResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "Users")
@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "List registered users with role and status filters (Admin only)")
    public ResponseEntity<PaginatedResponse<UserDto>> findAll(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search
    ) {
        PaginatedResponse<UserDto> response = userService.findAll(page, limit, role, status, search);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/students")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "List active students for enrollment picker (Admin only)")
    public ResponseEntity<List<UserDto>> findActiveStudents() {
        List<UserDto> students = userService.findActiveStudents();
        return ResponseEntity.ok(students);
    }

    @GetMapping("/instructors")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "List active instructors for course assignment picker (Admin only)")
    public ResponseEntity<List<UserDto>> findActiveInstructors() {
        List<UserDto> instructors = userService.findActiveInstructors();
        return ResponseEntity.ok(instructors);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Update user status (ACTIVE / DISABLED) (Admin only)")
    public ResponseEntity<UserDto> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication auth
    ) {
        String statusStr = body != null ? body.get("status") : null;
        UserStatus status = UserStatus.fromValue(statusStr);
        String currentUserEmail = auth != null ? auth.getName() : null;
        UserDto updated = userService.updateStatus(id, status, currentUserEmail);
        return ResponseEntity.ok(updated);
    }
}
