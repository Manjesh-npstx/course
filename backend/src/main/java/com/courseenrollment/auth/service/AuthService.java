package com.courseenrollment.auth.service;

import com.courseenrollment.auth.dto.AuthResponse;
import com.courseenrollment.auth.dto.LoginRequest;
import com.courseenrollment.auth.dto.RegisterRequest;
import com.courseenrollment.auth.dto.UserDto;
import com.courseenrollment.auth.entity.RefreshToken;
import com.courseenrollment.auth.entity.User;
import com.courseenrollment.auth.enums.UserRole;
import com.courseenrollment.auth.enums.UserStatus;
import com.courseenrollment.auth.repository.UserRepository;
import com.courseenrollment.common.exception.ConflictException;
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
        User user = new User(req.getEmail().trim(), req.getName().trim(), hashedPassword, role);
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

        return new AuthResponse(UserDto.fromEntity(savedUser), token, refreshTokenStr);
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

        return new AuthResponse(UserDto.fromEntity(savedUser), token, refreshTokenStr);
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

        return new AuthResponse(UserDto.fromEntity(user), token, refreshTokenStr);
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

        return new AuthResponse(UserDto.fromEntity(user), newAccessToken, rotatedToken.getToken());
    }

    @Transactional
    public void logout(String refreshTokenStr) {
        if (refreshTokenService != null && refreshTokenStr != null) {
            refreshTokenService.revokeToken(refreshTokenStr);
        }
    }
}
