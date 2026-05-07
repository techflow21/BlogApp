using BlogApp.Application.DTOs.Auth;
using BlogApp.Application.Interfaces;
using BlogApp.Domain.Entities;
using BlogApp.Domain.Interfaces;

namespace BlogApp.Application.Services;

public class IdentityService : IIdentityService
{
    private readonly IIdentityRepository _repo;
    private readonly IJwtService _jwt;
    private readonly IEmailService _email;

    public IdentityService(IIdentityRepository repo, IJwtService jwt, IEmailService email)
    {
        _repo = repo;
        _jwt = jwt;
        _email = email;
    }

    public async Task<(bool Success, string Message)> RegisterAsync(RegisterRequest req, string requestOrigin)
    {
        var existing = await _repo.FindByEmailAsync(req.Email);
        if (existing != null) return (false, "Email already registered.");

        var user = new User
        {
            Email = req.Email,
            NormalizedEmail = req.Email.ToUpper(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
            FullName = req.FullName,
            EmailConfirmed = false,
            CreatedAt = DateTime.UtcNow,
            Roles = new() { "User" },
            Claims = new() { { "CanPost", "true" } }
        };
        await _repo.CreateAsync(user);

        var token = new EmailConfirmationToken { UserId = user.Id };
        await _repo.CreateEmailTokenAsync(token);

        var link = $"{requestOrigin}/api/auth/confirm-email?token={token.Token}";
        var html = $"<p>Hi {user.FullName ?? user.Email},</p><p>Confirm your email: <a href=\"{link}\">Activate Account</a></p>";
        await _email.SendAsync(user.Email, "Confirm your email", html);

        return (true, "Registration successful. Please check your email to confirm your account.");
    }

    public async Task<(bool Success, string Message)> ConfirmEmailAsync(string token)
    {
        var et = await _repo.GetEmailTokenAsync(token);
        if (et is null) return (false, "Invalid or expired token.");
        var user = await _repo.FindByIdAsync(et.UserId);
        if (user is null) return (false, "User not found.");

        user.EmailConfirmed = true;
        await _repo.UpdateAsync(user);
        et.Used = true;
        await _repo.UpdateEmailTokenAsync(et);
        return (true, "Email confirmed. You can now sign in.");
    }

    public async Task<(bool Success, LoginResponse? Response, string Message)> LoginAsync(LoginRequest req)
    {
        var user = await _repo.FindByEmailAsync(req.Email);
        if (user is null) return (false, null, "Invalid credentials.");
        if (!user.EmailConfirmed) return (false, null, "Email not confirmed.");

        var valid = BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash);
        if (!valid) return (false, null, "Invalid credentials.");

        var (token, exp) = _jwt.CreateAccessToken(user);
        return (true, new LoginResponse(token, exp, user.Id, user.Email), "Login successful.");
    }

    public async Task<(bool Success, string Message)> ForgotPasswordAsync(ForgotPasswordRequest req, string requestOrigin)
    {
        var user = await _repo.FindByEmailAsync(req.Email);
        if (user is null) return (true, "If the email exists, a reset link has been sent.");

        var token = new PasswordResetToken { UserId = user.Id };
        await _repo.CreateResetTokenAsync(token);

        var link = $"{requestOrigin}/api/auth/reset-password?token={token.Token}";
        await _email.SendAsync(user.Email, "Reset your password", $"Reset it <a href=\"{link}\">here</a>.");

        return (true, "If the email exists, a reset link has been sent.");
    }

    public async Task<(bool Success, string Message)> ResetPasswordAsync(ResetPasswordRequest req)
    {
        var rt = await _repo.GetResetTokenAsync(req.Token);
        if (rt is null) return (false, "Invalid or expired token.");
        var user = await _repo.FindByIdAsync(rt.UserId);
        if (user is null) return (false, "User not found.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
        await _repo.UpdateAsync(user);
        rt.Used = true;
        await _repo.UpdateResetTokenAsync(rt);
        return (true, "Password has been reset.");
    }

    public async Task<UserProfileResponse?> GetProfileAsync(string userId)
    {
        var user = await _repo.FindByIdAsync(userId);
        if (user is null) return null;
        return new UserProfileResponse(user.Id, user.Email, user.FullName, user.ProfileImageUrl, user.Bio, user.Roles, user.Claims);
    }

    public async Task<bool> UpdateProfileAsync(string userId, UpdateProfileRequest req)
    {
        var user = await _repo.FindByIdAsync(userId);
        if (user is null) return false;

        if (!string.IsNullOrWhiteSpace(req.FullName))
            user.FullName = req.FullName;
        if (!string.IsNullOrWhiteSpace(req.Bio))
            user.Bio = req.Bio;

        await _repo.UpdateAsync(user);
        return true;
    }

    public async Task<bool> AddRoleAsync(string userId, string role)
    {
        var user = await _repo.FindByIdAsync(userId);
        if (user is null) return false;
        if (!user.Roles.Contains(role)) user.Roles.Add(role);
        await _repo.UpdateAsync(user);
        return true;
    }
}
