using BlogApp.Application.DTOs.Admin;
using BlogApp.Application.DTOs.Posts;
using BlogApp.Application.Interfaces;
using BlogApp.Domain.Entities;
using BlogApp.Domain.Interfaces;

namespace BlogApp.Application.Services;

public class AdminService : IAdminService
{
    private readonly IPostRepository _postRepo;
    private readonly ICommentRepository _commentRepo;
    private readonly IReactionRepository _reactionRepo;
    private readonly IIdentityRepository _identityRepo;

    public AdminService(
        IPostRepository postRepo,
        ICommentRepository commentRepo,
        IReactionRepository reactionRepo,
        IIdentityRepository identityRepo)
    {
        _postRepo = postRepo;
        _commentRepo = commentRepo;
        _reactionRepo = reactionRepo;
        _identityRepo = identityRepo;
    }

    public async Task<DashboardSummary> GetDashboardSummaryAsync()
    {
        var totalUsers = await _identityRepo.CountAllAsync();
        var totalPosts = await _postRepo.CountAllAsync();
        var publishedPosts = await _postRepo.CountByStatusAsync(PostStatus.Published);
        var totalComments = await _commentRepo.CountAllAsync();
        var totalReactions = await _reactionRepo.CountTotalReactionsAsync();

        var topPosts = await _postRepo.GetTopByViewsAsync(100);
        var totalViews = topPosts.Sum(p => (long)p.ViewCount);

        return new DashboardSummary(totalUsers, totalPosts, publishedPosts, totalComments, totalReactions, totalViews);
    }

    public async Task<List<TopPostResponse>> GetTopPostsByViewsAsync(int count)
    {
        var posts = await _postRepo.GetTopByViewsAsync(count);
        return posts.Select(MapToTopPost).ToList();
    }

    public async Task<List<TopPostResponse>> GetTopPostsByLikesAsync(int count)
    {
        var posts = await _postRepo.GetTopByLikesAsync(count);
        return posts.Select(MapToTopPost).ToList();
    }

    public async Task<List<PostResponse>> GetRecentPostsAsync(int count)
    {
        var posts = await _postRepo.GetRecentAsync(count);
        return posts.Select(MapToPostResponse).ToList();
    }

    public async Task<UserStatsResponse> GetUserStatsAsync()
    {
        var total = await _identityRepo.CountAllAsync();
        var active = await _identityRepo.CountActiveAsync();
        var thisMonth = await _identityRepo.CountRegisteredSinceAsync(new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1));
        return new UserStatsResponse(total, active, thisMonth);
    }

    public async Task<EngagementStatsResponse> GetEngagementStatsAsync()
    {
        var totalReactions = await _reactionRepo.CountTotalReactionsAsync();
        var totalComments = await _commentRepo.CountAllAsync();
        var totalPosts = await _postRepo.CountAllAsync();
        var avg = totalPosts > 0 ? (double)totalComments / totalPosts : 0;
        return new EngagementStatsResponse(totalReactions, totalComments, avg);
    }

    private static TopPostResponse MapToTopPost(Post p) => new(p.PostId!, p.Title, p.Slug, p.LikeCount, p.DislikeCount, p.CommentCount, p.ViewCount);

    private static PostResponse MapToPostResponse(Post p) => new(
        p.PostId, p.Title, p.Slug, p.Content, p.Summary,
        p.Tags, p.CoverImageUrl, p.CreatedBy, p.CreatedByName,
        p.CreatedAt, p.UpdatedAt, p.Status,
        p.LikeCount, p.DislikeCount, p.CommentCount, p.ViewCount);
}
