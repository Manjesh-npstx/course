package com.courseenrollment.auth.dto;

public class AuthResponse {
    private UserDto user;
    private String token;
    private String refreshToken;

    public AuthResponse() {
    }

    public AuthResponse(UserDto user, String token) {
        this.user = user;
        this.token = token;
    }

    public AuthResponse(UserDto user, String token, String refreshToken) {
        this.user = user;
        this.token = token;
        this.refreshToken = refreshToken;
    }

    public UserDto getUser() {
        return user;
    }

    public void setUser(UserDto user) {
        this.user = user;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
}
