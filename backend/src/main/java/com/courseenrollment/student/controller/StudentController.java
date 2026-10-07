package com.courseenrollment.student.controller;

import com.courseenrollment.common.dto.PaginatedResponse;
import com.courseenrollment.student.dto.CreateStudentRequest;
import com.courseenrollment.student.dto.UpdateStudentRequest;
import com.courseenrollment.student.entity.Student;
import com.courseenrollment.student.service.StudentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Students")
@RestController
@RequestMapping("/students")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Enroll a student in a course (Admin or Student self-enrollment)")
    public ResponseEntity<Student> create(@Valid @RequestBody CreateStudentRequest req) {
        Student student = studentService.create(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(student);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "List students (paginated, scoped to instructor courses if instructor)")
    public ResponseEntity<PaginatedResponse<Student>> findAll(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String search,
            org.springframework.security.core.Authentication auth
    ) {
        String instructorEmail = null;
        if (isInstructorOnly(auth)) {
            instructorEmail = auth.getName();
        }
        PaginatedResponse<Student> response = studentService.findAll(page, limit, search, instructorEmail);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Get a student by ID")
    public ResponseEntity<Student> findOne(@PathVariable Long id, org.springframework.security.core.Authentication auth) {
        Student student = studentService.findOne(id);
        if (isInstructorOnly(auth)) {
            String instructorEmail = auth.getName();
            boolean isOwner = student.getCourse() != null && student.getCourse().getInstructorEmail() != null &&
                    student.getCourse().getInstructorEmail().equalsIgnoreCase(instructorEmail);
            if (!isOwner) {
                throw new org.springframework.security.access.AccessDeniedException("Instructors can only view students enrolled in their own courses.");
            }
        }
        return ResponseEntity.ok(student);
    }

    private boolean isInstructorOnly(org.springframework.security.core.Authentication auth) {
        if (auth == null || auth.getAuthorities() == null) {
            return false;
        }
        boolean isInstructor = false;
        for (org.springframework.security.core.GrantedAuthority ga : auth.getAuthorities()) {
            if ("ROLE_ADMIN".equalsIgnoreCase(ga.getAuthority())) {
                return false;
            }
            if ("ROLE_INSTRUCTOR".equalsIgnoreCase(ga.getAuthority())) {
                isInstructor = true;
            }
        }
        return isInstructor;
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Update a student")
    public ResponseEntity<Student> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStudentRequest req
    ) {
        Student student = studentService.update(id, req);
        return ResponseEntity.ok(student);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(summary = "Unenroll a student")
    public ResponseEntity<Void> remove(@PathVariable Long id) {
        studentService.remove(id);
        return ResponseEntity.ok().build();
    }
}
