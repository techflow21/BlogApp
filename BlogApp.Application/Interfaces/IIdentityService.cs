using BlogApp.Application.DTOs.Auth;

namespace BlogApp.Application.Interfaces;

public interface IIdentityService
{
    Task<(bool Success, string Message)> RegisterAsync(RegisterRequest req, string requestOrigin);
    Task<(bool Success, string Message)> ConfirmEmailAsync(string token);
    Task<(bool Success, LoginResponse? Response, string Message)> LoginAsync(LoginRequest req);
    Task<(bool Success, string Message)> ForgotPasswordAsync(ForgotPasswordRequest req, string requestOrigin);
    Task<(bool Success, string Message)> ResetPasswordAsync(ResetPasswordRequest req);
    Task<UserProfileResponse?> GetProfileAsync(string userId);
    Task<bool> UpdateProfileAsync(string userId, UpdateProfileRequest req);
    Task<bool> AddRoleAsync(string userId, string role);
}
