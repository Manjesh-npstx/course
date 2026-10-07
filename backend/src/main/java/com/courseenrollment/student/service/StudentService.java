package com.courseenrollment.student.service;

import com.courseenrollment.auth.entity.User;
import com.courseenrollment.auth.enums.UserRole;
import com.courseenrollment.auth.enums.UserStatus;
import com.courseenrollment.auth.repository.UserRepository;
import com.courseenrollment.common.dto.PageMeta;
import com.courseenrollment.common.dto.PaginatedResponse;
import com.courseenrollment.common.exception.BadRequestException;
import com.courseenrollment.common.exception.ConflictException;
import com.courseenrollment.common.exception.ResourceNotFoundException;
import com.courseenrollment.course.entity.Course;
import com.courseenrollment.course.enums.CourseStatus;
import com.courseenrollment.course.repository.CourseRepository;
import com.courseenrollment.student.dto.CreateStudentRequest;
import com.courseenrollment.student.dto.UpdateStudentRequest;
import com.courseenrollment.student.entity.Student;
import com.courseenrollment.student.repository.StudentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final int maxCoursesPerStudent;

    @org.springframework.beans.factory.annotation.Autowired
    public StudentService(
            StudentRepository studentRepository,
            CourseRepository courseRepository,
            UserRepository userRepository,
            @Value("${app.enrollment.max-courses-per-student:0}") int maxCoursesPerStudent) {
        this.studentRepository = studentRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.maxCoursesPerStudent = maxCoursesPerStudent;
    }

    public StudentService(StudentRepository studentRepository, CourseRepository courseRepository, UserRepository userRepository) {
        this(studentRepository, courseRepository, userRepository, 0);
    }

    @Transactional
    public Student create(CreateStudentRequest req) {
        Course course = courseRepository.findById(req.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course with ID " + req.getCourseId() + " not found"));

        if (course.getStatus() != null && course.getStatus() != CourseStatus.APPROVED) {
            throw new ConflictException("Course is not approved for enrollment.");
        }

        long currentEnrollment = studentRepository.countByCourseId(req.getCourseId());
        if (currentEnrollment >= course.getSeatLimit()) {
            throw new ConflictException("Course is full. Cannot enroll more students.");
        }

        String email = req.getEmail().trim();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Student must be a registered user before enrolling."));
        if (user.getRole() != UserRole.STUDENT) {
            throw new BadRequestException("Only registered users with role 'STUDENT' can be enrolled in a course.");
        }
        if (user.getStatus() == UserStatus.DISABLED) {
            throw new BadRequestException("Cannot enroll a disabled student. Please enable the account first.");
        }

        if (maxCoursesPerStudent > 0) {
            long enrolledCount = studentRepository.countByEmailIgnoreCase(email);
            if (enrolledCount >= maxCoursesPerStudent) {
                throw new ConflictException("Student has reached the maximum course enrollment limit (" + maxCoursesPerStudent + ").");
            }
        }

        if (studentRepository.existsByEmailIgnoreCaseAndCourseId(email, req.getCourseId())) {
            throw new ConflictException("Student is already enrolled in this course.");
        }

        String enrollDate = (req.getEnrollDate() != null && !req.getEnrollDate().trim().isEmpty())
                ? req.getEnrollDate().trim()
                : LocalDate.now().toString();

        String studentName = (req.getName() != null && !req.getName().trim().isEmpty())
                ? req.getName().trim()
                : (user.getName() != null && !user.getName().trim().isEmpty() ? user.getName().trim() : user.getEmail());

        Student student = new Student(
                studentName,
                email,
                enrollDate,
                course
        );

        return studentRepository.save(student);
    }

    @Transactional
    public Student enrollSelf(Long courseId, String userEmail, String userName) {
        CreateStudentRequest req = new CreateStudentRequest(
                userName != null && !userName.trim().isEmpty() ? userName.trim() : userEmail,
                userEmail,
                LocalDate.now().toString(),
                courseId
        );
        return create(req);
    }

    @Transactional(readOnly = true)
    public PaginatedResponse<Student> findAll(int page, int limit, String search) {
        return findAll(page, limit, search, null);
    }

    @Transactional(readOnly = true)
    public PaginatedResponse<Student> findAll(int page, int limit, String search, String instructorEmail) {
        int take = Math.min(Math.max(limit, 1), 50);
        int pageIndex = Math.max(page - 1, 0);

        Pageable pageable = PageRequest.of(pageIndex, take, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Student> resultPage;

        boolean hasSearch = (search != null && !search.trim().isEmpty());
        boolean hasInstructor = (instructorEmail != null && !instructorEmail.trim().isEmpty());

        if (hasInstructor) {
            if (hasSearch) {
                resultPage = studentRepository.searchStudentsByInstructorEmail(instructorEmail.trim(), search.trim(), pageable);
            } else {
                resultPage = studentRepository.findByInstructorEmail(instructorEmail.trim(), pageable);
            }
        } else {
            if (hasSearch) {
                resultPage = studentRepository.searchStudents(search.trim(), pageable);
            } else {
                resultPage = studentRepository.findAll(pageable);
            }
        }

        long total = resultPage.getTotalElements();
        int totalPages = (int) Math.ceil((double) total / take);
        PageMeta meta = new PageMeta(total, page, take, totalPages);

        return new PaginatedResponse<>(resultPage.getContent(), meta);
    }

    @Transactional(readOnly = true)
    public Student findOne(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student with ID " + id + " not found"));
    }

    @Transactional
    public Student update(Long id, UpdateStudentRequest req) {
        Student student = findOne(id);

        if (req.getEmail() != null && !req.getEmail().trim().isEmpty()) {
            String newEmail = req.getEmail().trim();
            User user = userRepository.findByEmail(newEmail)
                    .orElseThrow(() -> new BadRequestException("Student must be a registered user before enrolling."));
            if (user.getRole() != UserRole.STUDENT) {
                throw new BadRequestException("Only registered users with role 'STUDENT' can be enrolled in a course.");
            }
            if (user.getStatus() == UserStatus.DISABLED) {
                throw new BadRequestException("Cannot transfer to a disabled student account. Please enable the account first.");
            }

            Long targetCourseId = (req.getCourseId() != null) ? req.getCourseId() : student.getCourse().getId();
            if (studentRepository.existsByEmailIgnoreCaseAndCourseIdAndIdNot(newEmail, targetCourseId, id)) {
                throw new ConflictException("Student is already enrolled in this course.");
            }
            student.setEmail(newEmail);
        }

        if (req.getCourseId() != null && !req.getCourseId().equals(student.getCourse().getId())) {
            Course newCourse = courseRepository.findById(req.getCourseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Course with ID " + req.getCourseId() + " not found"));

            if (newCourse.getStatus() != null && newCourse.getStatus() != CourseStatus.APPROVED) {
                throw new ConflictException("Target course is not approved for enrollment.");
            }

            long currentEnrollment = studentRepository.countByCourseId(req.getCourseId());
            if (currentEnrollment >= newCourse.getSeatLimit()) {
                throw new ConflictException("Target course is full. Cannot transfer student.");
            }

            String currentEmail = (req.getEmail() != null && !req.getEmail().trim().isEmpty()) ? req.getEmail().trim() : student.getEmail();
            if (studentRepository.existsByEmailIgnoreCaseAndCourseIdAndIdNot(currentEmail, req.getCourseId(), id)) {
                throw new ConflictException("Student is already enrolled in this course.");
            }
            student.setCourse(newCourse);
        }

        if (req.getName() != null && !req.getName().trim().isEmpty()) {
            student.setName(req.getName().trim());
        }

        if (req.getEnrollDate() != null && !req.getEnrollDate().trim().isEmpty()) {
            student.setEnrollDate(req.getEnrollDate().trim());
        }

        return studentRepository.save(student);
    }

    @Transactional
    public void remove(Long id) {
        Student student = findOne(id);
        Course course = student.getCourse();
        if (course != null && course.getStudents() != null) {
            course.getStudents().remove(student);
        }
        studentRepository.delete(student);
        studentRepository.flush();
    }

    @Transactional(readOnly = true)
    public List<Student> findByCourseId(Long courseId) {
        return studentRepository.findByCourseId(courseId);
    }

    @Transactional(readOnly = true)
    public List<Course> findEnrolledCoursesByEmail(String email) {
        return studentRepository.findEnrolledCoursesByEmail(email);
    }

    @Transactional(readOnly = true)
    public boolean isStudentEnrolled(String email, Long courseId) {
        if (email == null || courseId == null) {
            return false;
        }
        return studentRepository.existsByEmailIgnoreCaseAndCourseId(email.trim(), courseId);
    }
}
