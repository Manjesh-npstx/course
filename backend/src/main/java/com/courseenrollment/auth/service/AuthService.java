package com.courseenrollment.auth.service;

import com.courseenrollment.auth.dto.*;
import com.courseenrollment.auth.entity.RefreshToken;
import com.courseenrollment.auth.entity.User;
import com.courseenrollment.auth.enums.UserRole;
import com.courseenrollment.auth.enums.UserStatus;
import com.courseenrollment.auth.repository.UserRepository;
import com.courseenrollment.common.exception.BadRequestException;
import com.courseenrollment.common.exception.ConflictException;
import com.courseenrollment.common.exception.ResourceNotFoundException;
import com.courseenrollment.config.JwtService;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private com.courseenrollment.student.repository.StudentRepository studentRepository;

    public void setStudentRepository(com.courseenrollment.student.repository.StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    private UserDto toUserDto(User user) {
        if (user == null) return null;
        UserDto dto = UserDto.fromEntity(user);
        if (user.getRole() == UserRole.STUDENT && studentRepository != null) {
            java.util.List<com.courseenrollment.course.entity.Course> courses = studentRepository.findEnrolledCoursesByEmail(user.getEmail());
            dto.setEnrolledCourses(courses.stream()
                    .map(com.courseenrollment.course.entity.Course::getName)
                    .collect(java.util.stream.Collectors.toList()));
            dto.setEnrolledCourseIds(courses.stream()
                    .map(com.courseenrollment.course.entity.Course::getId)
                    .collect(java.util.stream.Collectors.toList()));
        } else {
            dto.setEnrolledCourses(java.util.Collections.emptyList());
            dto.setEnrolledCourseIds(java.util.Collections.emptyList());
        }
        return dto;
    }

    @org.springframework.beans.factory.annotation.Autowired
    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       RefreshTokenService refreshTokenService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
    }

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this(userRepository, passwordEncoder, jwtService, null);
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new ConflictException("Email already registered");
        }

        UserRole role = UserRole.STUDENT;
        if (req.getRole() != null && !req.getRole().trim().isEmpty()) {
            UserRole requestedRole = UserRole.fromValue(req.getRole().trim());
            // Prevent privilege escalation via public registration
            if (requestedRole != UserRole.ADMIN) {
                role = requestedRole;
            }
        }

        String hashedPassword = passwordEncoder.encode(req.getPassword());
        User user = new User(
                req.getEmail().trim(),
                req.getName().trim(),
                hashedPassword,
                role,
                UserStatus.ACTIVE,
                req.getPhone() != null ? req.getPhone().trim() : null
        );
        User savedUser = userRepository.save(user);

        String token = jwtService.generateToken(
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getRole().getValue()
        );

        String refreshTokenStr = null;
        if (refreshTokenService != null) {
            RefreshToken rt = refreshTokenService.createRefreshToken(savedUser);
            refreshTokenStr = rt.getToken();
        }

        return new AuthResponse(toUserDto(savedUser), token, refreshTokenStr);
    }

    @Transactional
    public AuthResponse switchRole(String email, String targetRole) {
        User user = userRepository.findByEmail(email.trim())
                .orElseThrow(() -> new BadCredentialsException("User not found"));

        UserRole newRole;
        if (targetRole != null && !targetRole.trim().isEmpty()) {
            newRole = UserRole.fromValue(targetRole.trim());
        } else {
            if (user.getRole() == UserRole.ADMIN) {
                newRole = UserRole.INSTRUCTOR;
            } else if (user.getRole() == UserRole.INSTRUCTOR) {
                newRole = UserRole.STUDENT;
            } else {
                newRole = UserRole.ADMIN;
            }
        }

        user.setRole(newRole);
        User savedUser = userRepository.save(user);

        String token = jwtService.generateToken(
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getRole().getValue()
        );

        String refreshTokenStr = null;
        if (refreshTokenService != null) {
            RefreshToken rt = refreshTokenService.createRefreshToken(savedUser);
            refreshTokenStr = rt.getToken();
        }

        return new AuthResponse(toUserDto(savedUser), token, refreshTokenStr);
    }

    @Transactional
    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail().trim())
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid username or password");
        }

        if (user.getStatus() == UserStatus.DISABLED) {
            throw new DisabledException("Account is disabled. Please contact the administrator.");
        }

        String token = jwtService.generateToken(
                user.getId(),
                user.getEmail(),
                user.getRole().getValue()
        );

        String refreshTokenStr = null;
        if (refreshTokenService != null) {
            RefreshToken rt = refreshTokenService.createRefreshToken(user);
            refreshTokenStr = rt.getToken();
        }

        return new AuthResponse(toUserDto(user), token, refreshTokenStr);
    }

    @Transactional
    public AuthResponse refreshToken(String refreshTokenStr) {
        if (refreshTokenService == null) {
            throw new BadCredentialsException("Refresh tokens not supported");
        }
        RefreshToken refreshToken = refreshTokenService.findByToken(refreshTokenStr);
        refreshTokenService.verifyExpiration(refreshToken);

        User user = refreshToken.getUser();
        if (user.getStatus() == UserStatus.DISABLED) {
            refreshTokenService.revokeAllUserTokens(user);
            throw new DisabledException("Account is disabled. Please contact the administrator.");
        }

        String newAccessToken = jwtService.generateToken(
                user.getId(),
                user.getEmail(),
                user.getRole().getValue()
        );

        RefreshToken rotatedToken = refreshTokenService.rotateRefreshToken(refreshToken);

        return new AuthResponse(toUserDto(user), newAccessToken, rotatedToken.getToken());
    }

    @Transactional
    public void logout(String refreshTokenStr) {
        if (refreshTokenService != null && refreshTokenStr != null) {
            refreshTokenService.revokeToken(refreshTokenStr);
        }
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest req) {
        User user = userRepository.findByEmail(req.getEmail().trim())
                .orElseThrow(() -> new ResourceNotFoundException("No account found with this email address"));

        if (user.getStatus() == UserStatus.DISABLED) {
            throw new DisabledException("Account is disabled. Please contact the administrator.");
        }

        if (req.getPhone() != null && !req.getPhone().trim().isEmpty() && user.getPhone() != null) {
            String inputDigits = req.getPhone().replaceAll("[^0-9]", "");
            String userDigits = user.getPhone().replaceAll("[^0-9]", "");
            if (!inputDigits.isEmpty() && !userDigits.isEmpty() && !inputDigits.equals(userDigits)) {
                throw new BadRequestException("Mobile number does not match registered account details");
            }
        }

        String hashedPassword = passwordEncoder.encode(req.getNewPassword());
        user.setPassword(hashedPassword);
        userRepository.save(user);

        if (refreshTokenService != null) {
            refreshTokenService.revokeAllUserTokens(user);
        }
    }

    @Transactional(readOnly = true)
    public UserDto getProfile(String email) {
        User user = userRepository.findByEmail(email.trim())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return toUserDto(user);
    }

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private com.courseenrollment.course.repository.CourseRepository courseRepository;

    public void setCourseRepository(com.courseenrollment.course.repository.CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    @Transactional
    public UserDto updateProfile(String email, UpdateProfileRequest req) {
        User user = userRepository.findByEmail(email.trim())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String oldName = user.getName();
        if (req.getName() != null && !req.getName().trim().isEmpty()) {
            user.setName(req.getName().trim());
        }
        if (req.getPhone() != null) {
            user.setPhone(req.getPhone().trim());
        }

        User updated = userRepository.save(user);

        // Synchronize course instructor display name for courses created by this instructor
        if (courseRepository != null && req.getName() != null && !req.getName().trim().isEmpty()) {
            courseRepository.updateInstructorName(email.trim(), req.getName().trim());
        }

        return toUserDto(updated);
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest req) {
        User user = userRepository.findByEmail(email.trim())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String oldPass = req.getOldPassword();
        if (oldPass == null || oldPass.trim().isEmpty()) {
            throw new BadCredentialsException("Old password is required");
        }

        if (!passwordEncoder.matches(oldPass, user.getPassword())) {
            throw new BadCredentialsException("Old password does not match");
        }

        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);

        if (refreshTokenService != null) {
            refreshTokenService.revokeAllUserTokens(user);
        }
    }
}
