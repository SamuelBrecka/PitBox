package com.pitbox.dto;

public record AuthResponse(
    String token,
    UserDto user
) {}
