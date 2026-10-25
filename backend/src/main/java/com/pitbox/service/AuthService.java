package com.pitbox.service;

import com.pitbox.dto.AuthResponse;
import com.pitbox.dto.LoginRequest;
import com.pitbox.dto.RegisterRequest;
import com.pitbox.dto.UserDto;
import com.pitbox.exception.EmailAlreadyExistsException;
import com.pitbox.exception.InvalidCredentialsException;
import com.pitbox.model.User;
import com.pitbox.repository.UserRepository;
import com.pitbox.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new EmailAlreadyExistsException("Email is already registered: " + normalizedEmail);
        }

        String encodedPassword = passwordEncoder.encode(request.password());
        User user = new User(normalizedEmail, encodedPassword, request.fullName().trim(), "ROLE_USER");
        User savedUser = userRepository.save(user);

        String token = jwtService.generateToken(savedUser.getId(), savedUser.getEmail(), savedUser.getRole());
        UserDto userDto = new UserDto(savedUser.getId(), savedUser.getEmail(), savedUser.getFullName(), savedUser.getRole());

        return new AuthResponse(token, userDto);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        User user = userRepository.findByEmail(normalizedEmail)
            .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole());
        UserDto userDto = new UserDto(user.getId(), user.getEmail(), user.getFullName(), user.getRole());

        return new AuthResponse(token, userDto);
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUser(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new InvalidCredentialsException("User not found"));
        return new UserDto(user.getId(), user.getEmail(), user.getFullName(), user.getRole());
    }
}
