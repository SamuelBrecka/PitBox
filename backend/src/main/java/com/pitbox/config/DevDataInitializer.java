package com.pitbox.config;

import com.pitbox.model.User;
import com.pitbox.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Profile("dev")
public class DevDataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DevDataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (!userRepository.existsByEmail("user@pitbox.io")) {
            userRepository.save(new User(
                "user@pitbox.io",
                passwordEncoder.encode("password123"),
                "Default User",
                "ROLE_USER"
            ));
        }

        if (!userRepository.existsByEmail("admin@pitbox.io")) {
            userRepository.save(new User(
                "admin@pitbox.io",
                passwordEncoder.encode("admin123"),
                "Admin User",
                "ROLE_ADMIN"
            ));
        }
    }
}
