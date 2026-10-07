package com.courseenrollment.auth.service;

import com.courseenrollment.auth.dto.UserDto;
import com.courseenrollment.auth.entity.User;
import com.courseenrollment.auth.enums.UserRole;
import com.courseenrollment.auth.enums.UserStatus;
import com.courseenrollment.auth.repository.UserRepository;
import com.courseenrollment.common.dto.PageMeta;
import com.courseenrollment.common.dto.PaginatedResponse;
import com.courseenrollment.common.exception.ConflictException;
import com.courseenrollment.common.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.courseenrollment.course.entity.Course;
import com.courseenrollment.student.repository.StudentRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;

    public UserService(UserRepository userRepository, StudentRepository studentRepository) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
    }

    @Transactional(readOnly = true)
    public PaginatedResponse<UserDto> findAll(int page, int limit, String role, String status, String search) {
        int take = Math.min(Math.max(limit, 1), 50);
        int pageIndex = Math.max(page - 1, 0);

        Pageable pageable = PageRequest.of(pageIndex, take, Sort.by(Sort.Direction.DESC, "createdAt"));

        UserRole userRole = (role != null && !role.trim().isEmpty()) ? UserRole.fromValue(role.trim()) : null;
        UserStatus userStatus = (status != null && !status.trim().isEmpty()) ? UserStatus.fromValue(status.trim()) : null;
        String searchTerm = (search != null && !search.trim().isEmpty()) ? search.trim() : null;

        Page<User> resultPage = userRepository.searchUsers(userRole, userStatus, searchTerm, pageable);

        List<UserDto> data = resultPage.getContent().stream()
                .map(user -> {
                    UserDto dto = UserDto.fromEntity(user);
                    if (user.getRole() == UserRole.STUDENT && studentRepository != null) {
                        List<String> courseNames = studentRepository.findEnrolledCoursesByEmail(user.getEmail())
                                .stream()
                                .map(Course::getName)
                                .collect(Collectors.toList());
                        dto.setEnrolledCourses(courseNames);
                    } else {
                        dto.setEnrolledCourses(Collections.emptyList());
                    }
                    return dto;
                })
                .collect(Collectors.toList());

        long total = resultPage.getTotalElements();
        int totalPages = (int) Math.ceil((double) total / take);
        PageMeta meta = new PageMeta(total, page, take, totalPages);

        return new PaginatedResponse<>(data, meta);
    }

    @Transactional(readOnly = true)
    public List<UserDto> findActiveStudents() {
        return userRepository.findByRoleAndStatus(UserRole.STUDENT, UserStatus.ACTIVE).stream()
                .map(UserDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserDto> findActiveInstructors() {
        return userRepository.findByRoleAndStatus(UserRole.INSTRUCTOR, UserStatus.ACTIVE).stream()
                .map(UserDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public User findOne(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User with ID " + id + " not found"));
    }

    @Transactional
    public UserDto updateStatus(Long id, UserStatus newStatus, String currentUserEmail) {
        User user = findOne(id);

        if (currentUserEmail != null && user.getEmail().equalsIgnoreCase(currentUserEmail.trim())) {
            throw new ConflictException("Admins cannot modify their own account status.");
        }

        user.setStatus(newStatus != null ? newStatus : UserStatus.ACTIVE);
        User updated = userRepository.save(user);
        return UserDto.fromEntity(updated);
    }
}
