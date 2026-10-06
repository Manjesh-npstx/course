package com.courseenrollment.auth;

import com.courseenrollment.auth.dto.UserDto;
import com.courseenrollment.auth.entity.User;
import com.courseenrollment.auth.enums.UserRole;
import com.courseenrollment.auth.enums.UserStatus;
import com.courseenrollment.auth.repository.UserRepository;
import com.courseenrollment.auth.service.UserService;
import com.courseenrollment.common.dto.PaginatedResponse;
import com.courseenrollment.common.exception.ConflictException;
import com.courseenrollment.common.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import com.courseenrollment.student.repository.StudentRepository;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private StudentRepository studentRepository;

    @InjectMocks
    private UserService userService;

    private User adminUser;
    private User studentUser;

    @BeforeEach
    void setUp() {
        adminUser = new User("admin@test.com", "Admin User", "$2a$10$hashed", UserRole.ADMIN, UserStatus.ACTIVE);
        adminUser.setId(1L);

        studentUser = new User("student@test.com", "Student User", "$2a$10$hashed", UserRole.STUDENT, UserStatus.ACTIVE);
        studentUser.setId(2L);
    }

    @Test
    @DisplayName("findAll should return paginated list of users")
    void findAll_success() {
        Page<User> userPage = new PageImpl<>(List.of(adminUser, studentUser));
        when(userRepository.searchUsers(eq(UserRole.STUDENT), eq(UserStatus.ACTIVE), eq("student"), any(Pageable.class)))
                .thenReturn(userPage);
        when(studentRepository.findEnrolledCoursesByEmail("student@test.com"))
                .thenReturn(List.of());

        PaginatedResponse<UserDto> response = userService.findAll(1, 10, "student", "active", "student");

        assertThat(response.getData()).hasSize(2);
        assertThat(response.getMeta().getTotal()).isEqualTo(2);
        verify(userRepository, times(1)).searchUsers(eq(UserRole.STUDENT), eq(UserStatus.ACTIVE), eq("student"), any(Pageable.class));
    }

    @Test
    @DisplayName("findActiveStudents should return list of active students")
    void findActiveStudents_success() {
        when(userRepository.findByRoleAndStatus(UserRole.STUDENT, UserStatus.ACTIVE))
                .thenReturn(List.of(studentUser));

        List<UserDto> result = userService.findActiveStudents();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getEmail()).isEqualTo("student@test.com");
        assertThat(result.get(0).getStatus()).isEqualTo("active");
    }

    @Test
    @DisplayName("findOne should return user when found")
    void findOne_success() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(studentUser));

        User result = userService.findOne(2L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(2L);
        assertThat(result.getEmail()).isEqualTo("student@test.com");
    }

    @Test
    @DisplayName("findOne should throw ResourceNotFoundException when user does not exist")
    void findOne_notFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.findOne(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User with ID 99 not found");
    }

    @Test
    @DisplayName("updateStatus should update user status and return updated UserDto")
    void updateStatus_success() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(studentUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserDto updated = userService.updateStatus(2L, UserStatus.DISABLED, "admin@test.com");

        assertThat(updated.getStatus()).isEqualTo("disabled");
        assertThat(studentUser.getStatus()).isEqualTo(UserStatus.DISABLED);
        verify(userRepository, times(1)).save(studentUser);
    }

    @Test
    @DisplayName("updateStatus should throw ConflictException when admin tries to disable self")
    void updateStatus_selfDisable_throwsConflict() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));

        assertThatThrownBy(() -> userService.updateStatus(1L, UserStatus.DISABLED, "admin@test.com"))
                .isInstanceOf(ConflictException.class)
                .hasMessage("Admins cannot modify their own account status.");

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("updateStatus should throw ResourceNotFoundException when user does not exist")
    void updateStatus_notFound_throwsNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.updateStatus(99L, UserStatus.DISABLED, "admin@test.com"))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(userRepository, never()).save(any(User.class));
    }
}
