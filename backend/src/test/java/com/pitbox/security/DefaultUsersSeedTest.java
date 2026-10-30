package com.pitbox.security;

import com.pitbox.config.DevDataInitializer;
import com.pitbox.model.User;
import com.pitbox.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class DefaultUsersSeedTest {

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Test
    void shouldVerifyPasswordHashesUsedInFlywayMigration() {
        String userHash = "$2a$10$eNYMyB159okOIrp2zYOK3u6.cYcLeyGL.PBVaMjXtdbqwSBqibt9O";
        String adminHash = "$2a$10$bxhSH1Va4V72f8dC67pU3u/fd7QbL9AWI6W4hekiNUxCgRFvoBaGO";

        assertTrue(passwordEncoder.matches("password123", userHash), "Default user password must match");
        assertTrue(passwordEncoder.matches("admin123", adminHash), "Admin user password must match");
    }

    @Test
    void shouldSeedDefaultAndAdminUsersWhenNotPresent() {
        UserRepository userRepository = mock(UserRepository.class);
        when(userRepository.existsByEmail("user@pitbox.io")).thenReturn(false);
        when(userRepository.existsByEmail("admin@pitbox.io")).thenReturn(false);

        DevDataInitializer initializer = new DevDataInitializer(userRepository, passwordEncoder);
        initializer.run();

        verify(userRepository, times(2)).save(any(User.class));
    }

    @Test
    void shouldNotSeedUsersWhenAlreadyExist() {
        UserRepository userRepository = mock(UserRepository.class);
        when(userRepository.existsByEmail("user@pitbox.io")).thenReturn(true);
        when(userRepository.existsByEmail("admin@pitbox.io")).thenReturn(true);

        DevDataInitializer initializer = new DevDataInitializer(userRepository, passwordEncoder);
        initializer.run();

        verify(userRepository, never()).save(any(User.class));
    }
}
