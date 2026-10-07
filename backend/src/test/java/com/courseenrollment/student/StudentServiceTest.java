package com.courseenrollment.student;

import com.courseenrollment.auth.entity.User;
import com.courseenrollment.auth.enums.UserRole;
import com.courseenrollment.auth.enums.UserStatus;
import com.courseenrollment.auth.repository.UserRepository;
import com.courseenrollment.common.dto.PaginatedResponse;
import com.courseenrollment.common.exception.BadRequestException;
import com.courseenrollment.common.exception.ConflictException;
import com.courseenrollment.common.exception.ResourceNotFoundException;
import com.courseenrollment.course.entity.Course;
import com.courseenrollment.course.repository.CourseRepository;
import com.courseenrollment.student.dto.CreateStudentRequest;
import com.courseenrollment.student.dto.UpdateStudentRequest;
import com.courseenrollment.student.entity.Student;
import com.courseenrollment.student.repository.StudentRepository;
import com.courseenrollment.student.service.StudentService;
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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudentServiceTest {

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private UserRepository userRepository;

    private StudentService studentService;

    private Course mockCourse;
    private Student mockStudent;
    private User mockUser;

    @BeforeEach
    void setUp() {
        studentService = new StudentService(studentRepository, courseRepository, userRepository);
        mockCourse = new Course("React 101", "Jane Smith", 2);
        mockCourse.setId(1L);

        mockStudent = new Student("Alice", "alice@test.com", "2026-01-01", mockCourse);
        mockStudent.setId(1L);

        mockUser = new User("alice@test.com", "Alice", "password", UserRole.STUDENT);
        mockUser.setId(1L);
    }

    @Test
    @DisplayName("create should enroll a registered student when seats are available")
    void create_success() {
        CreateStudentRequest req = new CreateStudentRequest("Alice", "alice@test.com", "2026-01-01", 1L);
        when(courseRepository.findById(1L)).thenReturn(Optional.of(mockCourse));
        when(studentRepository.countByCourseId(1L)).thenReturn(0L);
        when(userRepository.findByEmail("alice@test.com")).thenReturn(Optional.of(mockUser));
        when(studentRepository.existsByEmailIgnoreCaseAndCourseId("alice@test.com", 1L)).thenReturn(false);
        when(studentRepository.save(any(Student.class))).thenReturn(mockStudent);

        Student created = studentService.create(req);

        assertThat(created).isNotNull();
        assertThat(created.getName()).isEqualTo("Alice");
        verify(studentRepository).save(any(Student.class));
    }

    @Test
    @DisplayName("create should allow same student to enroll in another course (multi-course enrollment)")
    void create_multiCourse_success() {
        Course course2 = new Course("Vue 101", "Bob Smith", 5);
        course2.setId(2L);
        Student studentInCourse2 = new Student("Alice", "alice@test.com", "2026-01-01", course2);
        studentInCourse2.setId(2L);

        CreateStudentRequest req = new CreateStudentRequest("Alice", "alice@test.com", "2026-01-01", 2L);
        when(courseRepository.findById(2L)).thenReturn(Optional.of(course2));
        when(studentRepository.countByCourseId(2L)).thenReturn(1L);
        when(userRepository.findByEmail("alice@test.com")).thenReturn(Optional.of(mockUser));
        when(studentRepository.existsByEmailIgnoreCaseAndCourseId("alice@test.com", 2L)).thenReturn(false);
        when(studentRepository.save(any(Student.class))).thenReturn(studentInCourse2);

        Student created = studentService.create(req);

        assertThat(created).isNotNull();
        assertThat(created.getEmail()).isEqualTo("alice@test.com");
        assertThat(created.getCourse().getId()).isEqualTo(2L);
        verify(studentRepository).save(any(Student.class));
    }

    @Test
    @DisplayName("create should throw BadRequestException when student is not a registered user")
    void create_unregisteredStudent_throwsBadRequest() {
        CreateStudentRequest req = new CreateStudentRequest("Stranger", "stranger@test.com", null, 1L);
        when(courseRepository.findById(1L)).thenReturn(Optional.of(mockCourse));
        when(studentRepository.countByCourseId(1L)).thenReturn(0L);
        when(userRepository.findByEmail("stranger@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> studentService.create(req))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Student must be a registered user before enrolling.");

        verify(studentRepository, never()).save(any(Student.class));
    }

    @Test
    @DisplayName("create should throw BadRequestException when registered user does not have STUDENT role")
    void create_nonStudentRole_throwsBadRequest() {
        User adminUser = new User("admin@test.com", "Admin", "password", UserRole.ADMIN);
        CreateStudentRequest req = new CreateStudentRequest("Admin", "admin@test.com", null, 1L);
        when(courseRepository.findById(1L)).thenReturn(Optional.of(mockCourse));
        when(studentRepository.countByCourseId(1L)).thenReturn(0L);
        when(userRepository.findByEmail("admin@test.com")).thenReturn(Optional.of(adminUser));

        assertThatThrownBy(() -> studentService.create(req))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Only registered users with role 'STUDENT' can be enrolled in a course.");

        verify(studentRepository, never()).save(any(Student.class));
    }

    @Test
    @DisplayName("create should throw BadRequestException when student account is disabled")
    void create_disabledStudent_throwsBadRequest() {
        User disabledUser = new User("disabled@test.com", "Disabled", "password", UserRole.STUDENT, UserStatus.DISABLED);
        CreateStudentRequest req = new CreateStudentRequest("Disabled", "disabled@test.com", null, 1L);
        when(courseRepository.findById(1L)).thenReturn(Optional.of(mockCourse));
        when(studentRepository.countByCourseId(1L)).thenReturn(0L);
        when(userRepository.findByEmail("disabled@test.com")).thenReturn(Optional.of(disabledUser));

        assertThatThrownBy(() -> studentService.create(req))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Cannot enroll a disabled student. Please enable the account first.");

        verify(studentRepository, never()).save(any(Student.class));
    }

    @Test
    @DisplayName("create should throw ConflictException when maxCoursesPerStudent limit is reached")
    void create_maxCoursesLimitReached_throwsConflict() {
        StudentService limitedService = new StudentService(studentRepository, courseRepository, userRepository, 2);
        CreateStudentRequest req = new CreateStudentRequest("Alice", "alice@test.com", null, 1L);
        when(courseRepository.findById(1L)).thenReturn(Optional.of(mockCourse));
        when(studentRepository.countByCourseId(1L)).thenReturn(0L);
        when(userRepository.findByEmail("alice@test.com")).thenReturn(Optional.of(mockUser));
        when(studentRepository.countByEmailIgnoreCase("alice@test.com")).thenReturn(2L);

        assertThatThrownBy(() -> limitedService.create(req))
                .isInstanceOf(ConflictException.class)
                .hasMessage("Student has reached the maximum course enrollment limit (2).");

        verify(studentRepository, never()).save(any(Student.class));
    }

    @Test
    @DisplayName("create should throw ResourceNotFoundException when course does not exist")
    void create_courseNotFound() {
        CreateStudentRequest req = new CreateStudentRequest("Ghost", "g@g.com", null, 999L);
        when(courseRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> studentService.create(req))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Course with ID 999 not found");

        verify(studentRepository, never()).save(any(Student.class));
    }

    @Test
    @DisplayName("create should throw ConflictException when course is full (seat limit enforcement)")
    void create_courseFull() {
        CreateStudentRequest req = new CreateStudentRequest("Dave", "dave@test.com", null, 1L);
        when(courseRepository.findById(1L)).thenReturn(Optional.of(mockCourse)); // seatLimit = 2
        when(studentRepository.countByCourseId(1L)).thenReturn(2L); // 2 enrolled

        assertThatThrownBy(() -> studentService.create(req))
                .isInstanceOf(ConflictException.class)
                .hasMessage("Course is full. Cannot enroll more students.");

        verify(studentRepository, never()).save(any(Student.class));
    }

    @Test
    @DisplayName("create should throw ConflictException when student already enrolled in same course")
    void create_duplicateEnrollmentInSameCourse() {
        CreateStudentRequest req = new CreateStudentRequest("Alice", "alice@test.com", null, 1L);
        when(courseRepository.findById(1L)).thenReturn(Optional.of(mockCourse));
        when(studentRepository.countByCourseId(1L)).thenReturn(0L);
        when(userRepository.findByEmail("alice@test.com")).thenReturn(Optional.of(mockUser));
        when(studentRepository.existsByEmailIgnoreCaseAndCourseId("alice@test.com", 1L)).thenReturn(true);

        assertThatThrownBy(() -> studentService.create(req))
                .isInstanceOf(ConflictException.class)
                .hasMessage("Student is already enrolled in this course.");

        verify(studentRepository, never()).save(any(Student.class));
    }

    @Test
    @DisplayName("findAll should return paginated students")
    void findAll_success() {
        Page<Student> page = new PageImpl<>(List.of(mockStudent));
        when(studentRepository.findAll(any(Pageable.class))).thenReturn(page);

        PaginatedResponse<Student> result = studentService.findAll(1, 10, null);

        assertThat(result.getData()).hasSize(1);
        assertThat(result.getMeta().getTotal()).isEqualTo(1);
    }

    @Test
    @DisplayName("findOne should return student by ID")
    void findOne_success() {
        when(studentRepository.findById(1L)).thenReturn(Optional.of(mockStudent));

        Student found = studentService.findOne(1L);

        assertThat(found.getName()).isEqualTo("Alice");
    }

    @Test
    @DisplayName("findOne should throw ResourceNotFoundException when student not found")
    void findOne_notFound() {
        when(studentRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> studentService.findOne(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Student with ID 999 not found");
    }

    @Test
    @DisplayName("update should update student name and date")
    void update_success() {
        when(studentRepository.findById(1L)).thenReturn(Optional.of(mockStudent));
        when(studentRepository.save(any(Student.class))).thenReturn(mockStudent);

        UpdateStudentRequest req = new UpdateStudentRequest("Alice Updated", null, null, null);
        Student updated = studentService.update(1L, req);

        assertThat(updated.getName()).isEqualTo("Alice Updated");
    }

    @Test
    @DisplayName("update should transfer student to another course when seats are available")
    void update_transferCourse_success() {
        Course targetCourse = new Course("Advanced TS", "Bob", 5);
        targetCourse.setId(2L);

        when(studentRepository.findById(1L)).thenReturn(Optional.of(mockStudent));
        when(courseRepository.findById(2L)).thenReturn(Optional.of(targetCourse));
        when(studentRepository.countByCourseId(2L)).thenReturn(1L);
        when(studentRepository.save(any(Student.class))).thenReturn(mockStudent);

        UpdateStudentRequest req = new UpdateStudentRequest(null, null, null, 2L);
        Student updated = studentService.update(1L, req);

        assertThat(updated.getCourse()).isEqualTo(targetCourse);
    }

    @Test
    @DisplayName("update should throw ConflictException when target course is full during transfer")
    void update_transferCourse_targetFull() {
        Course targetCourse = new Course("Advanced TS", "Bob", 1);
        targetCourse.setId(2L);

        when(studentRepository.findById(1L)).thenReturn(Optional.of(mockStudent));
        when(courseRepository.findById(2L)).thenReturn(Optional.of(targetCourse));
        when(studentRepository.countByCourseId(2L)).thenReturn(1L); // already 1 student

        UpdateStudentRequest req = new UpdateStudentRequest(null, null, null, 2L);

        assertThatThrownBy(() -> studentService.update(1L, req))
                .isInstanceOf(ConflictException.class)
                .hasMessage("Target course is full. Cannot transfer student.");
    }

    @Test
    @DisplayName("create should throw ConflictException when course is not approved")
    void create_courseNotApproved() {
        Course pendingCourse = new Course("Draft Course", "Jane", 10, com.courseenrollment.course.enums.CourseStatus.PENDING, "jane@test.com");
        pendingCourse.setId(5L);
        CreateStudentRequest req = new CreateStudentRequest("Dave", "dave@test.com", null, 5L);
        when(courseRepository.findById(5L)).thenReturn(Optional.of(pendingCourse));

        assertThatThrownBy(() -> studentService.create(req))
                .isInstanceOf(ConflictException.class)
                .hasMessage("Course is not approved for enrollment.");

        verify(studentRepository, never()).save(any(Student.class));
    }

    @Test
    @DisplayName("remove should delete student")
    void remove_success() {
        when(studentRepository.findById(1L)).thenReturn(Optional.of(mockStudent));

        studentService.remove(1L);

        verify(studentRepository).delete(mockStudent);
    }
}
