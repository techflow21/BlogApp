using BlogApp.Application.DTOs.Admin;
using BlogApp.Application.DTOs.Posts;

namespace BlogApp.Application.Interfaces;

public interface IAdminService
{
    Task<DashboardSummary> GetDashboardSummaryAsync();
    Task<List<TopPostResponse>> GetTopPostsByViewsAsync(int count);
    Task<List<TopPostResponse>> GetTopPostsByLikesAsync(int count);
    Task<List<PostResponse>> GetRecentPostsAsync(int count);
    Task<UserStatsResponse> GetUserStatsAsync();
    Task<EngagementStatsResponse> GetEngagementStatsAsync();
}
