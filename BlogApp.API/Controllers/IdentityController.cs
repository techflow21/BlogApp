using BlogApp.API.DTOs;
using BlogApp.API.Models;
using BlogApp.API.Repository;
using BlogApp.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BlogApp.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class IdentityController : ControllerBase
    {
        private readonly IdentityRepository _identityRepo;
        private readonly IJwtService _jwt;
        private readonly IEmailService _email;
        private readonly IConfiguration _config;

        public IdentityController(IdentityRepository identityRepo, IJwtService jwt, IEmailService email, IConfiguration config)
        {
            _identityRepo = identityRepo;
            _jwt = jwt;
            _email = email;
            _config = config;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequest req)
        {
            var existing = await _identityRepo.FindByEmailAsync(req.Email);
            if (existing != null) return BadRequest("Email already registered.");

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
            await _identityRepo.CreateAsync(user);

            // send confirmation
            var token = new EmailConfirmationToken { UserId = user.Id };
            await _identityRepo.CreateEmailTokenAsync(token);

            var origin = $"{Request.Scheme}://{Request.Host}";
            var link = $"{origin}/api/auth/confirm-email?token={token.Token}";
            var html = $"<p>Hi {user.FullName ?? user.Email},</p><p>Confirm your email: <a href=\"{link}\">Activate Account</a></p>";
            await _email.SendAsync(user.Email, "Confirm your email", html);

            return Ok("Registration successful. Please check your email to confirm your account.");
        }

        [HttpGet("confirm-email")]
        public async Task<IActionResult> ConfirmEmail([FromQuery] string token)
        {
            var et = await _identityRepo.GetEmailTokenAsync(token);
            if (et is null) return BadRequest("Invalid or expired token.");
            var user = await _identityRepo.FindByIdAsync(et.UserId);
            if (user is null) return NotFound();

            user.EmailConfirmed = true;
            await _identityRepo.UpdateAsync(user);
            et.Used = true;
            await _identityRepo.UpdateEmailTokenAsync(et);
            return Ok("Email confirmed. You can now sign in.");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest req)
        {
            var user = await _identityRepo.FindByEmailAsync(req.Email);
            if (user is null) return Unauthorized("Invalid credentials.");
            if (!user.EmailConfirmed) return Unauthorized("Email not confirmed.");

            var valid = BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash);
            if (!valid) return Unauthorized("Invalid credentials.");

            var (token, exp) = _jwt.CreateAccessToken(user);
            return Ok(new LoginResponse(token, exp, user.Id, user.Email));
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordRequest req)
        {
            var user = await _identityRepo.FindByEmailAsync(req.Email);
            if (user is null) return Ok(); // do not reveal user existence

            var token = new PasswordResetToken { UserId = user.Id };
            await _identityRepo.CreateResetTokenAsync(token);

            var origin = $"{Request.Scheme}://{Request.Host}";
            var link = $"{origin}/api/auth/reset-password?token={token.Token}";
            await _email.SendAsync(user.Email, "Reset your password", $"Reset it <a href=\"{link}\">here</a>.");

            return Ok("If the email exists, a reset link has been sent.");
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword(ResetPasswordRequest req)
        {
            var rt = await _identityRepo.GetResetTokenAsync(req.Token);
            if (rt is null) return BadRequest("Invalid or expired token.");
            var user = await _identityRepo.FindByIdAsync(rt.UserId);
            if (user is null) return NotFound();

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
            await _identityRepo.UpdateAsync(user);
            rt.Used = true;
            await _identityRepo.UpdateResetTokenAsync(rt);
            return Ok("Password has been reset.");
        }


        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> Me()
        {
            var uid = User.FindFirstValue("uid")!;
            var user = await _identityRepo.FindByIdAsync(uid);
            if (user is null) return NotFound();
            return Ok(new
            {
                user.Id,
                user.Email,
                user.FullName,
                user.ProfileImageUrl,
                user.Roles,
                user.Claims
            });
        }

        [Authorize]
        [HttpPut("me")]
        public async Task<IActionResult> Update([FromForm] UpdateProfileRequest req, IFormFile? profileImage)
        {
            var uid = User.FindFirstValue("uid")!;
            var user = await _identityRepo.FindByIdAsync(uid);
            if (user is null) return NotFound();

            if (!string.IsNullOrWhiteSpace(req.FullName))
                user.FullName = req.FullName;

            if (profileImage is not null && profileImage.Length > 0)
            {
                //var url = await _files.SaveProfileImageAsync(profileImage, uid);
                //user.ProfileImageUrl = url;
            }

            await _identityRepo.UpdateAsync(user);
            return NoContent();
        }


        [Authorize(Roles = "Admin")]
        [HttpPost("{id}/role")]
        public async Task<IActionResult> AddRole(string id, [FromQuery] string role)
        {
            var user = await _identityRepo.FindByIdAsync(id);
            if (user is null) return NotFound();
            if (!user.Roles.Contains(role)) user.Roles.Add(role);
            await _identityRepo.UpdateAsync(user);
            return NoContent();
        }


        [Authorize(Policy = "CanPostPolicy")]
        [HttpGet("can-post-check")]
        public IActionResult CanPostCheck() => Ok(new { canPost = true });

    }
}
