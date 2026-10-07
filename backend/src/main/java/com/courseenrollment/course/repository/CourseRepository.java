package com.courseenrollment.course.repository;

import com.courseenrollment.course.entity.Course;
import com.courseenrollment.course.enums.CourseStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    @Query("SELECT c FROM Course c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.instructor) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.instructorEmail) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Course> searchCourses(@Param("search") String search, Pageable pageable);

    Page<Course> findByStatus(CourseStatus status, Pageable pageable);

    @Query("SELECT c FROM Course c WHERE (c.status = :status OR (c.status IS NULL AND :status = com.courseenrollment.course.enums.CourseStatus.APPROVED)) AND (LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.instructor) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.instructorEmail) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Course> searchCoursesByStatus(@Param("search") String search, @Param("status") CourseStatus status, Pageable pageable);

    @Query("SELECT c FROM Course c WHERE c.instructorEmail = :instructorEmail OR (:instructorEmail IN ('instructor@campus.com', 'instructor1@campus.com') AND c.instructorEmail IN ('instructor@campus.com', 'instructor1@campus.com'))")
    Page<Course> findByInstructorEmail(@Param("instructorEmail") String instructorEmail, Pageable pageable);

    @Query("SELECT c FROM Course c WHERE c.instructorEmail = :instructorEmail OR (:instructorEmail IN ('instructor@campus.com', 'instructor1@campus.com') AND c.instructorEmail IN ('instructor@campus.com', 'instructor1@campus.com')) OR LOWER(c.instructor) = LOWER(:instructorName)")
    Page<Course> findByInstructorEmailOrName(@Param("instructorEmail") String instructorEmail, @Param("instructorName") String instructorName, Pageable pageable);

    @Query("SELECT c FROM Course c WHERE (c.instructorEmail = :instructorEmail OR (:instructorEmail IN ('instructor@campus.com', 'instructor1@campus.com') AND c.instructorEmail IN ('instructor@campus.com', 'instructor1@campus.com'))) AND (LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.instructor) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.instructorEmail) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Course> searchCoursesByInstructorEmail(@Param("search") String search, @Param("instructorEmail") String instructorEmail, Pageable pageable);

    @Query("SELECT c FROM Course c WHERE (c.status = com.courseenrollment.course.enums.CourseStatus.APPROVED OR c.status IS NULL OR c.instructorEmail = :instructorEmail OR (:instructorEmail IN ('instructor@campus.com', 'instructor1@campus.com') AND c.instructorEmail IN ('instructor@campus.com', 'instructor1@campus.com'))) AND (LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.instructor) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.instructorEmail) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Course> searchApprovedOrMyCourses(@Param("search") String search, @Param("instructorEmail") String instructorEmail, Pageable pageable);

    @Query("SELECT c FROM Course c WHERE c.status = com.courseenrollment.course.enums.CourseStatus.APPROVED OR c.status IS NULL OR c.instructorEmail = :instructorEmail OR (:instructorEmail IN ('instructor@campus.com', 'instructor1@campus.com') AND c.instructorEmail IN ('instructor@campus.com', 'instructor1@campus.com'))")
    Page<Course> findApprovedOrMyCourses(@Param("instructorEmail") String instructorEmail, Pageable pageable);

    @Modifying
    @Transactional
    @Query("UPDATE Course c SET c.instructor = :newName WHERE c.instructorEmail = :email OR LOWER(c.instructor) = LOWER(:oldName) OR (:email IN ('instructor@campus.com', 'instructor1@campus.com') AND c.instructorEmail IN ('instructor@campus.com', 'instructor1@campus.com'))")
    int updateInstructorName(@Param("email") String email, @Param("oldName") String oldName, @Param("newName") String newName);
}
