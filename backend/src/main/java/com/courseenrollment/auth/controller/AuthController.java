package com.courseenrollment.auth.controller;

import com.courseenrollment.auth.dto.*;
import com.courseenrollment.auth.service.AuthService;
import com.courseenrollment.common.exception.BadRequestException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "Auth")
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
        AuthResponse response = authService.register(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    @Operation(summary = "Login and receive JWT access token and refresh token")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        AuthResponse response = authService.login(req);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh JWT access token using a valid refresh token")
    public ResponseEntity<AuthResponse> refresh(@RequestBody(required = false) Map<String, String> body) {
        String refreshToken = body != null ? body.get("refreshToken") : null;
        if (refreshToken == null || refreshToken.trim().isEmpty()) {
            throw new BadRequestException("Refresh token is required");
        }
        AuthResponse response = authService.refreshToken(refreshToken.trim());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    @Operation(summary = "Revoke refresh token on user logout")
    public ResponseEntity<Map<String, String>> logout(@RequestBody(required = false) Map<String, String> body) {
        String refreshToken = body != null ? body.get("refreshToken") : null;
        if (refreshToken != null && !refreshToken.trim().isEmpty()) {
            authService.logout(refreshToken.trim());
        }
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset account password with email and phone verification")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        authService.resetPassword(req);
        return ResponseEntity.ok(Map.of("message", "Password reset successfully. Please login with your new password."));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile")
    public ResponseEntity<UserDto> getProfile(Authentication auth) {
        if (auth == null || auth.getName() == null) {
            throw new org.springframework.security.authentication.BadCredentialsException("Not authenticated");
        }
        UserDto profile = authService.getProfile(auth.getName());
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/me")
    @Operation(summary = "Update current user profile information (name, phone)")
    public ResponseEntity<UserDto> updateProfile(@Valid @RequestBody UpdateProfileRequest req, Authentication auth) {
        if (auth == null || auth.getName() == null) {
            throw new org.springframework.security.authentication.BadCredentialsException("Not authenticated");
        }
        UserDto profile = authService.updateProfile(auth.getName(), req);
        return ResponseEntity.ok(profile);
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change password for logged in user")
    public ResponseEntity<Map<String, String>> changePassword(@Valid @RequestBody ChangePasswordRequest req, Authentication auth) {
        if (auth == null || auth.getName() == null) {
            throw new org.springframework.security.authentication.BadCredentialsException("Not authenticated");
        }
        authService.changePassword(auth.getName(), req);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    @PostMapping("/switch-role")
    @Operation(summary = "Switch the current authenticated user's role between admin and student")
    public ResponseEntity<AuthResponse> switchRole(
            @RequestBody(required = false) Map<String, String> body,
            Authentication auth
    ) {
        String role = body != null ? body.get("role") : null;
        String email = auth != null ? auth.getName() : null;
        if (email == null) {
            throw new org.springframework.security.authentication.BadCredentialsException("Not authenticated");
        }
        AuthResponse response = authService.switchRole(email, role);
        return ResponseEntity.ok(response);
    }
}
