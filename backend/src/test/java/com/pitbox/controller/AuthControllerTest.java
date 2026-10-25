package com.pitbox.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pitbox.dto.LoginRequest;
import com.pitbox.dto.RegisterRequest;
import com.pitbox.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    void shouldRegisterNewUserSuccessfully() throws Exception {
        RegisterRequest request = new RegisterRequest("john@pitbox.io", "password123", "John Doe");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.token", notNullValue()))
            .andExpect(jsonPath("$.user.email", is("john@pitbox.io")))
            .andExpect(jsonPath("$.user.fullName", is("John Doe")))
            .andExpect(jsonPath("$.user.role", is("ROLE_USER")));
    }

    @Test
    void shouldFailRegistrationWhenEmailAlreadyExists() throws Exception {
        RegisterRequest request = new RegisterRequest("existing@pitbox.io", "password123", "John Doe");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated());

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.error", notNullValue()));
    }

    @Test
    void shouldLoginSuccessfullyWithValidCredentials() throws Exception {
        RegisterRequest register = new RegisterRequest("login@pitbox.io", "secret123", "Login User");
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(register)))
            .andExpect(status().isCreated());

        LoginRequest login = new LoginRequest("login@pitbox.io", "secret123");
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(login)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.token", notNullValue()))
            .andExpect(jsonPath("$.user.email", is("login@pitbox.io")));
    }

    @Test
    void shouldRejectLoginWithInvalidPassword() throws Exception {
        RegisterRequest register = new RegisterRequest("wrongpw@pitbox.io", "secret123", "Wrong User");
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(register)))
            .andExpect(status().isCreated());

        LoginRequest login = new LoginRequest("wrongpw@pitbox.io", "incorrect");
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(login)))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldFetchCurrentUserWithValidToken() throws Exception {
        RegisterRequest register = new RegisterRequest("profile@pitbox.io", "secret123", "Profile User");
        MvcResult registerResult = mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(register)))
            .andExpect(status().isCreated())
            .andReturn();

        String responseBody = registerResult.getResponse().getContentAsString();
        String token = objectMapper.readTree(responseBody).get("token").asText();

        mockMvc.perform(get("/api/auth/me")
                .header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email", is("profile@pitbox.io")))
            .andExpect(jsonPath("$.fullName", is("Profile User")));
    }

    @Test
    void shouldRejectCurrentUserWithoutToken() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
            .andExpect(status().isUnauthorized());
    }
}
