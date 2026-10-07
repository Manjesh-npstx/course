package com.courseenrollment.course.service;

import com.courseenrollment.auth.entity.User;
import com.courseenrollment.auth.enums.UserRole;
import com.courseenrollment.auth.enums.UserStatus;
import com.courseenrollment.auth.repository.UserRepository;
import com.courseenrollment.common.dto.PageMeta;
import com.courseenrollment.common.dto.PaginatedResponse;
import com.courseenrollment.common.exception.BadRequestException;
import com.courseenrollment.common.exception.ConflictException;
import com.courseenrollment.common.exception.ResourceNotFoundException;
import com.courseenrollment.course.dto.CreateCourseRequest;
import com.courseenrollment.course.dto.UpdateCourseRequest;
import com.courseenrollment.course.entity.Course;
import com.courseenrollment.course.enums.CourseStatus;
import com.courseenrollment.course.repository.CourseRepository;
import com.courseenrollment.student.entity.Student;
import com.courseenrollment.student.repository.StudentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;

    public CourseService(
            CourseRepository courseRepository,
            StudentRepository studentRepository,
            UserRepository userRepository
    ) {
        this.courseRepository = courseRepository;
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Course create(CreateCourseRequest req) {
        return create(req, null, UserRole.ADMIN);
    }

    @Transactional
    public Course create(CreateCourseRequest req, String userEmail, UserRole role) {
        String instructorName;
        String instructorEmail;

        if (role == UserRole.INSTRUCTOR) {
            instructorEmail = userEmail;
            instructorName = (userEmail != null && userRepository != null)
                    ? userRepository.findByEmail(userEmail)
                            .map(User::getName)
                            .orElseGet(() -> (req.getInstructor() != null && !req.getInstructor().trim().isEmpty())
                                    ? req.getInstructor().trim()
                                    : userEmail)
                    : ((req.getInstructor() != null && !req.getInstructor().trim().isEmpty())
                            ? req.getInstructor().trim()
                            : userEmail);
        } else {
            // Admin is creating the course
            // Admin cannot be instructor; instructor must be registered active instructor
            String targetEmail = (req.getInstructorEmail() != null && !req.getInstructorEmail().trim().isEmpty())
                    ? req.getInstructorEmail().trim()
                    : null;

            java.util.Optional<User> instructorOpt = java.util.Optional.empty();
            if (targetEmail != null && userRepository != null) {
                instructorOpt = userRepository.findByEmail(targetEmail);
                if (instructorOpt.isEmpty()) {
                    throw new BadRequestException("Instructor not found with email: " + targetEmail);
                }
            } else if (req.getInstructor() != null && !req.getInstructor().trim().isEmpty() && userRepository != null) {
                instructorOpt = userRepository.findByEmail(req.getInstructor().trim());
            }

            if (instructorOpt.isPresent()) {
                User instUser = instructorOpt.get();
                if (instUser.getRole() == UserRole.ADMIN) {
                    throw new BadRequestException("An admin cannot be assigned as an instructor.");
                }
                if (instUser.getRole() != UserRole.INSTRUCTOR) {
                    throw new BadRequestException("Selected user is not an instructor.");
                }
                if (instUser.getStatus() != UserStatus.ACTIVE) {
                    throw new BadRequestException("Selected instructor account is disabled.");
                }
                instructorName = instUser.getName();
                instructorEmail = instUser.getEmail();
            } else {
                if (userEmail != null && userEmail.equalsIgnoreCase(req.getInstructor() != null ? req.getInstructor().trim() : "")) {
                    throw new BadRequestException("An admin cannot be assigned as an instructor.");
                }
                instructorName = (req.getInstructor() != null && !req.getInstructor().trim().isEmpty())
                        ? req.getInstructor().trim()
                        : "Instructor";
                instructorEmail = null;
            }
        }

        CourseStatus initialStatus = (role == UserRole.INSTRUCTOR)
                ? CourseStatus.PENDING
                : CourseStatus.APPROVED;

        Course course = new Course(
                req.getName().trim(),
                instructorName,
                req.getSeatLimit(),
                initialStatus,
                instructorEmail
        );
        return courseRepository.save(course);
    }

    @Transactional
    public Course approve(Long id) {
        Course course = findOne(id);
        course.setStatus(CourseStatus.APPROVED);
        return courseRepository.save(course);
    }

    @Transactional
    public Course reject(Long id) {
        Course course = findOne(id);
        course.setStatus(CourseStatus.REJECTED);
        return courseRepository.save(course);
    }

    @Transactional
    public Course updateStatus(Long id, CourseStatus status) {
        Course course = findOne(id);
        course.setStatus(status != null ? status : CourseStatus.APPROVED);
        return courseRepository.save(course);
    }

    @Transactional(readOnly = true)
    public PaginatedResponse<Course> findAll(int page, int limit, String search) {
        return findAll(page, limit, search, null, null, null);
    }

    @Transactional(readOnly = true)
    public PaginatedResponse<Course> findAll(
            int page,
            int limit,
            String search,
            String statusParam,
            String userEmail,
            String userRole
    ) {
        int take = Math.min(Math.max(limit, 1), 50);
        int pageIndex = Math.max(page - 1, 0);

        Pageable pageable = PageRequest.of(pageIndex, take, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Course> resultPage;

        boolean hasSearch = (search != null && !search.trim().isEmpty());
        String searchTerm = hasSearch ? search.trim() : null;

        boolean isAdmin = "ROLE_ADMIN".equalsIgnoreCase(userRole) || "admin".equalsIgnoreCase(userRole);
        boolean isInstructor = "ROLE_INSTRUCTOR".equalsIgnoreCase(userRole) || "instructor".equalsIgnoreCase(userRole);

        if (isAdmin) {
            if (statusParam != null && !statusParam.trim().isEmpty() && !"all".equalsIgnoreCase(statusParam.trim())) {
                CourseStatus targetStatus = CourseStatus.fromValue(statusParam.trim());
                if (hasSearch) {
                    resultPage = courseRepository.searchCoursesByStatus(searchTerm, targetStatus, pageable);
                } else {
                    resultPage = courseRepository.findByStatus(targetStatus, pageable);
                }
            } else {
                if (hasSearch) {
                    resultPage = courseRepository.searchCourses(searchTerm, pageable);
                } else {
                    resultPage = courseRepository.findAll(pageable);
                }
            }
        } else if (isInstructor && userEmail != null) {
            if ("pending".equalsIgnoreCase(statusParam)) {
                if (hasSearch) {
                    resultPage = courseRepository.searchCoursesByStatus(searchTerm, CourseStatus.PENDING, pageable);
                } else {
                    resultPage = courseRepository.findByStatus(CourseStatus.PENDING, pageable);
                }
            } else if ("approved".equalsIgnoreCase(statusParam)) {
                if (hasSearch) {
                    resultPage = courseRepository.searchCoursesByStatus(searchTerm, CourseStatus.APPROVED, pageable);
                } else {
                    resultPage = courseRepository.findByStatus(CourseStatus.APPROVED, pageable);
                }
            } else {
                if (hasSearch) {
                    resultPage = courseRepository.searchApprovedOrMyCourses(searchTerm, userEmail, pageable);
                } else {
                    resultPage = courseRepository.findApprovedOrMyCourses(userEmail, pageable);
                }
            }
        } else {
            // Public or Student: ONLY APPROVED courses are visible
            if (hasSearch) {
                resultPage = courseRepository.searchCoursesByStatus(searchTerm, CourseStatus.APPROVED, pageable);
            } else {
                resultPage = courseRepository.findByStatus(CourseStatus.APPROVED, pageable);
            }
        }

        long total = resultPage.getTotalElements();
        int totalPages = (int) Math.ceil((double) total / take);
        PageMeta meta = new PageMeta(total, page, take, totalPages);

        return new PaginatedResponse<>(resultPage.getContent(), meta);
    }

    @Transactional(readOnly = true)
    public PaginatedResponse<Course> getMyCourses(String userEmail, String userRole, int page, int limit) {
        int take = Math.min(Math.max(limit, 1), 50);
        int pageIndex = Math.max(page - 1, 0);

        Pageable pageable = PageRequest.of(pageIndex, take, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Course> resultPage;

        boolean isInstructor = "ROLE_INSTRUCTOR".equalsIgnoreCase(userRole) || "instructor".equalsIgnoreCase(userRole);
        boolean isAdmin = "ROLE_ADMIN".equalsIgnoreCase(userRole) || "admin".equalsIgnoreCase(userRole);

        if (isInstructor && userEmail != null) {
            // Instructor sees all their created courses (pending, approved, rejected)
            resultPage = courseRepository.findByInstructorEmail(userEmail, pageable);
        } else if (isAdmin) {
            // Admin sees all courses
            resultPage = courseRepository.findAll(pageable);
        } else {
            // Student sees all courses where they are enrolled
            resultPage = studentRepository.findEnrolledCoursesByEmail(userEmail != null ? userEmail : "", pageable);
        }

        long total = resultPage.getTotalElements();
        int totalPages = (int) Math.ceil((double) total / take);
        PageMeta meta = new PageMeta(total, page, take, totalPages);

        return new PaginatedResponse<>(resultPage.getContent(), meta);
    }

    @Transactional(readOnly = true)
    public Course findOne(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course with ID " + id + " not found"));
    }

    @Transactional
    public Course update(Long id, UpdateCourseRequest req) {
        Course course = findOne(id);

        if (req.getSeatLimit() != null) {
            long currentEnrollment = studentRepository.countByCourseId(id);
            if (req.getSeatLimit() < currentEnrollment) {
                throw new ConflictException(
                        "Cannot reduce seat limit to " + req.getSeatLimit() + ". " + currentEnrollment + " student(s) currently enrolled."
                );
            }
            course.setSeatLimit(req.getSeatLimit());
        }

        if (req.getName() != null && !req.getName().trim().isEmpty()) {
            course.setName(req.getName().trim());
        }

        if (req.getInstructorEmail() != null && !req.getInstructorEmail().trim().isEmpty()) {
            if (userRepository != null) {
                User instUser = userRepository.findByEmail(req.getInstructorEmail().trim())
                        .orElseThrow(() -> new BadRequestException("Instructor not found with email: " + req.getInstructorEmail().trim()));
                if (instUser.getRole() == UserRole.ADMIN) {
                    throw new BadRequestException("An admin cannot be assigned as an instructor.");
                }
                if (instUser.getRole() != UserRole.INSTRUCTOR) {
                    throw new BadRequestException("Selected user is not an instructor.");
                }
                if (instUser.getStatus() != UserStatus.ACTIVE) {
                    throw new BadRequestException("Selected instructor account is disabled.");
                }
                course.setInstructor(instUser.getName());
                course.setInstructorEmail(instUser.getEmail());
            }
        } else if (req.getInstructor() != null && !req.getInstructor().trim().isEmpty()) {
            if (userRepository != null) {
                java.util.Optional<User> instOpt = userRepository.findByEmail(req.getInstructor().trim());
                if (instOpt.isPresent()) {
                    User instUser = instOpt.get();
                    if (instUser.getRole() == UserRole.ADMIN) {
                        throw new BadRequestException("An admin cannot be assigned as an instructor.");
                    }
                    if (instUser.getRole() != UserRole.INSTRUCTOR) {
                        throw new BadRequestException("Selected user is not an instructor.");
                    }
                    if (instUser.getStatus() != UserStatus.ACTIVE) {
                        throw new BadRequestException("Selected instructor account is disabled.");
                    }
                    course.setInstructor(instUser.getName());
                    course.setInstructorEmail(instUser.getEmail());
                } else {
                    course.setInstructor(req.getInstructor().trim());
                }
            } else {
                course.setInstructor(req.getInstructor().trim());
            }
        }

        if (req.getStatus() != null && !req.getStatus().trim().isEmpty()) {
            course.setStatus(CourseStatus.fromValue(req.getStatus().trim()));
        }

        return courseRepository.save(course);
    }

    @Transactional
    public void remove(Long id) {
        Course course = findOne(id);
        long enrolledCount = studentRepository.countByCourseId(id);
        if (enrolledCount > 0) {
            throw new ConflictException("Cannot delete course with active student enrollments. Please unenroll all students first.");
        }
        courseRepository.delete(course);
        courseRepository.flush();
    }

    @Transactional(readOnly = true)
    public PaginatedResponse<Student> findStudentsByCourseId(Long courseId, int page, int limit) {
        findOne(courseId);

        int take = Math.min(Math.max(limit, 1), 50);
        int pageIndex = Math.max(page - 1, 0);

        Pageable pageable = PageRequest.of(pageIndex, take, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Student> resultPage = studentRepository.findByCourseId(courseId, pageable);

        long total = resultPage.getTotalElements();
        int totalPages = (int) Math.ceil((double) total / take);
        PageMeta meta = new PageMeta(total, page, take, totalPages);

        return new PaginatedResponse<>(resultPage.getContent(), meta);
    }
}
