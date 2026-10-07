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
            String hashed = passwordEncoder.encode("admin123");
            User admin = new User("admin@campus.com", "Admin User", hashed, UserRole.ADMIN, UserStatus.ACTIVE, "9876543210");
            userRepository.save(admin);
            log.info("Seeded admin account: admin@campus.com / admin123 (phone: 9876543210)");
        }

        if (!userRepository.existsByEmail("instructor@campus.com")) {
            String hashed = passwordEncoder.encode("instructor123");
            User instructor = new User("instructor@campus.com", "Dr. Jane Instructor", hashed, UserRole.INSTRUCTOR, UserStatus.ACTIVE, "9876543211");
            userRepository.save(instructor);
            log.info("Seeded instructor account: instructor@campus.com / instructor123 (phone: 9876543211)");
        }

        User student = null;
        if (!userRepository.existsByEmail("student@campus.com")) {
            String hashed = passwordEncoder.encode("student123");
            student = new User("student@campus.com", "Alice Student", hashed, UserRole.STUDENT, UserStatus.ACTIVE, "9876543212");
            student = userRepository.save(student);
            log.info("Seeded student account: student@campus.com / student123 (phone: 9876543212)");
        } else {
            student = userRepository.findByEmail("student@campus.com").orElse(null);
        }

        if (courseRepository.count() == 0) {
            Course webDev = new Course("Web Development", "Dr. Jane Instructor", 30, CourseStatus.APPROVED, "instructor@campus.com");
            webDev = courseRepository.save(webDev);

            Course dsa = new Course("Data Structures & Algorithms", "Dr. Jane Instructor", 35, CourseStatus.APPROVED, "instructor@campus.com");
            courseRepository.save(dsa);

            Course cloud = new Course("Cloud Computing Architecture", "Dr. Jane Instructor", 20, CourseStatus.PENDING, "instructor@campus.com");
            courseRepository.save(cloud);

            log.info("Seeded courses: Web Development (APPROVED), Data Structures & Algorithms (APPROVED), Cloud Computing Architecture (PENDING)");

            if (student != null) {
                Student enrolled = new Student(student.getName(), student.getEmail(), LocalDate.now().toString(), webDev);
                studentRepository.save(enrolled);
                log.info("Seeded enrollment for Alice Student in Web Development");
            }
        }
    }
}
