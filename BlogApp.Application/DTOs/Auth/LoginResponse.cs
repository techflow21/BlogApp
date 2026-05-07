namespace BlogApp.Application.DTOs.Auth;

public record LoginResponse(string Token, DateTime Expires, string UserId, string Email);
