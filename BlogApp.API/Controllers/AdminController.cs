using BlogApp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BlogApp.API.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _admin;

    public AdminController(IAdminService admin)
    {
        _admin = admin;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard() => Ok(await _admin.GetDashboardSummaryAsync());

    [HttpGet("top-posts/views")]
    public async Task<IActionResult> TopPostsByViews([FromQuery] int count = 10) =>
        Ok(await _admin.GetTopPostsByViewsAsync(count));

    [HttpGet("top-posts/likes")]
    public async Task<IActionResult> TopPostsByLikes([FromQuery] int count = 10) =>
        Ok(await _admin.GetTopPostsByLikesAsync(count));

    [HttpGet("recent-posts")]
    public async Task<IActionResult> RecentPosts([FromQuery] int count = 10) =>
        Ok(await _admin.GetRecentPostsAsync(count));

    [HttpGet("user-stats")]
    public async Task<IActionResult> UserStats() => Ok(await _admin.GetUserStatsAsync());

    [HttpGet("engagement-stats")]
    public async Task<IActionResult> EngagementStats() => Ok(await _admin.GetEngagementStatsAsync());
}
