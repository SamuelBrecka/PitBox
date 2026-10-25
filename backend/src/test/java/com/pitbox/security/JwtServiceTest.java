package com.pitbox.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretConfig", "test-secret-key-that-is-sufficiently-long-for-hmac-sha256");
        ReflectionTestUtils.setField(jwtService, "expirationMs", 3600000L);
        jwtService.init();
    }

    @Test
    void shouldGenerateAndValidateTokenSuccessfully() {
        UUID userId = UUID.randomUUID();
        String email = "mechanic@pitbox.io";
        String role = "ROLE_USER";

        String token = jwtService.generateToken(userId, email, role);

        assertNotNull(token);
        assertTrue(jwtService.validateToken(token));
        assertEquals(userId, jwtService.extractUserId(token));
        assertEquals(email, jwtService.extractEmail(token));
    }

    @Test
    void shouldRejectInvalidToken() {
        assertFalse(jwtService.validateToken("invalid.token.here"));
    }
}
