package com.courseenrollment.auth;

import com.courseenrollment.auth.entity.RefreshToken;
import com.courseenrollment.auth.entity.User;
import com.courseenrollment.auth.enums.UserRole;
import com.courseenrollment.auth.repository.RefreshTokenRepository;
import com.courseenrollment.auth.service.RefreshTokenService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    private RefreshTokenService refreshTokenService;
    private User testUser;

    @BeforeEach
    void setUp() {
        refreshTokenService = new RefreshTokenService(refreshTokenRepository, 604800000L);
        testUser = new User("user@test.com", "Test User", "hashed", UserRole.STUDENT);
        testUser.setId(10L);
    }

    @Test
    @DisplayName("createRefreshToken should save and return a new RefreshToken")
    void createRefreshToken_success() {
        when(refreshTokenRepository.save(any(RefreshToken.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        RefreshToken rt = refreshTokenService.createRefreshToken(testUser);

        assertThat(rt).isNotNull();
        assertThat(rt.getToken()).isNotBlank();
        assertThat(rt.getUser()).isEqualTo(testUser);
        assertThat(rt.isRevoked()).isFalse();
        assertThat(rt.getExpiryDate()).isAfter(Instant.now());
        verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    @Test
    @DisplayName("findByToken should return token when exists")
    void findByToken_success() {
        RefreshToken rt = new RefreshToken("token-123", testUser, Instant.now().plusSeconds(3600));
        when(refreshTokenRepository.findByToken("token-123")).thenReturn(Optional.of(rt));

        RefreshToken found = refreshTokenService.findByToken("token-123");

        assertThat(found).isEqualTo(rt);
    }

    @Test
    @DisplayName("findByToken should throw BadCredentialsException when token not found")
    void findByToken_notFound() {
        when(refreshTokenRepository.findByToken("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> refreshTokenService.findByToken("missing"))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessage("Invalid or expired refresh token");
    }

    @Test
    @DisplayName("verifyExpiration should succeed for valid token")
    void verifyExpiration_valid() {
        RefreshToken rt = new RefreshToken("token-123", testUser, Instant.now().plusSeconds(3600));
        RefreshToken verified = refreshTokenService.verifyExpiration(rt);
        assertThat(verified).isEqualTo(rt);
    }

    @Test
    @DisplayName("verifyExpiration should throw BadCredentialsException for expired token")
    void verifyExpiration_expired() {
        RefreshToken rt = new RefreshToken("token-123", testUser, Instant.now().minusSeconds(10));

        assertThatThrownBy(() -> refreshTokenService.verifyExpiration(rt))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessage("Invalid or expired refresh token");
    }

    @Test
    @DisplayName("verifyExpiration should throw BadCredentialsException for revoked token")
    void verifyExpiration_revoked() {
        RefreshToken rt = new RefreshToken("token-123", testUser, Instant.now().plusSeconds(3600));
        rt.setRevoked(true);

        assertThatThrownBy(() -> refreshTokenService.verifyExpiration(rt))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessage("Invalid or expired refresh token");
    }

    @Test
    @DisplayName("rotateRefreshToken should revoke old token and return a new one")
    void rotateRefreshToken_success() {
        RefreshToken oldRt = new RefreshToken("old-token", testUser, Instant.now().plusSeconds(3600));
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(inv -> inv.getArgument(0));

        RefreshToken newRt = refreshTokenService.rotateRefreshToken(oldRt);

        assertThat(oldRt.isRevoked()).isTrue();
        assertThat(newRt).isNotNull();
        assertThat(newRt.getToken()).isNotEqualTo("old-token");
        verify(refreshTokenRepository, times(2)).save(any(RefreshToken.class));
    }

    @Test
    @DisplayName("revokeToken should set revoked to true")
    void revokeToken_success() {
        RefreshToken rt = new RefreshToken("token-to-revoke", testUser, Instant.now().plusSeconds(3600));
        when(refreshTokenRepository.findByToken("token-to-revoke")).thenReturn(Optional.of(rt));
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(inv -> inv.getArgument(0));

        refreshTokenService.revokeToken("token-to-revoke");

        assertThat(rt.isRevoked()).isTrue();
        verify(refreshTokenRepository).save(rt);
    }
}
