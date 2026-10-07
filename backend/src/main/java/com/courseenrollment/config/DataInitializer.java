package com.courseenrollment.config;

import com.courseenrollment.auth.entity.User;
import com.courseenrollment.auth.enums.UserRole;
import com.courseenrollment.auth.enums.UserStatus;
import com.courseenrollment.auth.repository.UserRepository;
import com.courseenrollment.course.entity.Course;
import com.courseenrollment.course.enums.CourseStatus;
import com.courseenrollment.course.repository.CourseRepository;
import com.courseenrollment.student.entity.Student;
import com.courseenrollment.student.repository.StudentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DataInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            UserRepository userRepository,
            CourseRepository courseRepository,
            StudentRepository studentRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!userRepository.existsByEmail("admin@campus.com")) {
            String hashed = passwordEncoder.encode("Admin@1234");
            User admin = new User("admin@campus.com", "Admin User", hashed, UserRole.ADMIN, UserStatus.ACTIVE, "9876543210");
            userRepository.save(admin);
            log.info("Seeded admin account: admin@campus.com / Admin@1234 (phone: 9876543210)");
        }

        if (!userRepository.existsByEmail("instructor1@campus.com")) {
            String hashed = passwordEncoder.encode("Instructor@1234");
            User instructor1 = new User("instructor1@campus.com", "Dr. Jane Instructor", hashed, UserRole.INSTRUCTOR, UserStatus.ACTIVE, "9876543211");
            userRepository.save(instructor1);
            log.info("Seeded instructor 1: instructor1@campus.com / Instructor@1234 (phone: 9876543211)");
        }

        if (!userRepository.existsByEmail("instructor2@campus.com")) {
            String hashed = passwordEncoder.encode("Instructor@1234");
            User instructor2 = new User("instructor2@campus.com", "Dr. Alan Turing", hashed, UserRole.INSTRUCTOR, UserStatus.ACTIVE, "9876543213");
            userRepository.save(instructor2);
            log.info("Seeded instructor 2: instructor2@campus.com / Instructor@1234 (phone: 9876543213)");
        }

        User student = null;
        if (!userRepository.existsByEmail("student@campus.com")) {
            String hashed = passwordEncoder.encode("Student@1234");
            student = new User("student@campus.com", "Alice Student", hashed, UserRole.STUDENT, UserStatus.ACTIVE, "9876543212");
            student = userRepository.save(student);
            log.info("Seeded student account: student@campus.com / Student@1234 (phone: 9876543212)");
        } else {
            student = userRepository.findByEmail("student@campus.com").orElse(null);
        }

        if (courseRepository.count() == 0) {
            Course webDev = new Course("Web Development", "Dr. Jane Instructor", 30, CourseStatus.APPROVED, "instructor1@campus.com");
            webDev = courseRepository.save(webDev);

            Course ai = new Course("Artificial Intelligence & Neural Networks", "Dr. Alan Turing", 35, CourseStatus.APPROVED, "instructor2@campus.com");
            courseRepository.save(ai);

            Course cloud = new Course("Cloud Computing Architecture", "Dr. Jane Instructor", 20, CourseStatus.PENDING, "instructor1@campus.com");
            courseRepository.save(cloud);

            log.info("Seeded courses: Web Development (APPROVED), Artificial Intelligence & Neural Networks (APPROVED), Cloud Computing Architecture (PENDING)");

            if (student != null) {
                Student enrolled = new Student(student.getName(), student.getEmail(), LocalDate.now().toString(), webDev);
                studentRepository.save(enrolled);
                log.info("Seeded enrollment for Alice Student in Web Development");
            }
        }
    }
}
