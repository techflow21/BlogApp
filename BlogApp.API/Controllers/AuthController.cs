using BlogApp.Application.DTOs.Auth;
using BlogApp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BlogApp.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IIdentityService _identity;

    public AuthController(IIdentityService identity)
    {
        _identity = identity;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest req)
    {
        var origin = $"{Request.Scheme}://{Request.Host}";
        var (success, message) = await _identity.RegisterAsync(req, origin);
        if (!success) return BadRequest(message);
        return Ok(message);
    }

    [HttpGet("confirm-email")]
    public async Task<IActionResult> ConfirmEmail([FromQuery] string token)
    {
        var (success, message) = await _identity.ConfirmEmailAsync(token);
        if (!success) return BadRequest(message);
        return Ok(message);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest req)
    {
        var (success, response, message) = await _identity.LoginAsync(req);
        if (!success) return Unauthorized(message);
        return Ok(response);
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordRequest req)
    {
        var origin = $"{Request.Scheme}://{Request.Host}";
        var (_, message) = await _identity.ForgotPasswordAsync(req, origin);
        return Ok(message);
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(ResetPasswordRequest req)
    {
        var (success, message) = await _identity.ResetPasswordAsync(req);
        if (!success) return BadRequest(message);
        return Ok(message);
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var uid = User.FindFirstValue("uid")!;
        var profile = await _identity.GetProfileAsync(uid);
        if (profile is null) return NotFound();
        return Ok(profile);
    }

    [Authorize]
    [HttpPut("me")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest req)
    {
        var uid = User.FindFirstValue("uid")!;
        var success = await _identity.UpdateProfileAsync(uid, req);
        if (!success) return NotFound();
        return NoContent();
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("{id}/role")]
    public async Task<IActionResult> AddRole(string id, [FromQuery] string role)
    {
        var success = await _identity.AddRoleAsync(id, role);
        if (!success) return NotFound();
        return NoContent();
    }
}
