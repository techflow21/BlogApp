using System.Text.RegularExpressions;
using BlogApp.Application.DTOs.Posts;
using BlogApp.Application.Interfaces;
using BlogApp.Domain.Entities;
using BlogApp.Domain.Interfaces;

namespace BlogApp.Application.Services;

public class PostService : IPostService
{
    private readonly IPostRepository _repo;
    private readonly ICacheService _cache;

    public PostService(IPostRepository repo, ICacheService cache)
    {
        _repo = repo;
        _cache = cache;
    }

    public async Task<PostListResponse> GetAllAsync(int page, int pageSize, string? tag, string? status)
    {
        var cacheKey = $"posts_page_{page}_{pageSize}_{tag}_{status}";
        var cached = await _cache.GetAsync<PostListResponse>(cacheKey);
        if (cached != null) return cached;

        var posts = await _repo.GetAllAsync(page, pageSize, tag, status);
        var total = await _repo.CountAllAsync();
        var result = new PostListResponse(posts.Select(MapToResponse).ToList(), page, pageSize, total);

        await _cache.SetAsync(cacheKey, result, TimeSpan.FromMinutes(5));
        return result;
    }

    public async Task<PostResponse?> GetByIdAsync(string id)
    {
        var cacheKey = $"post_{id}";
        var cached = await _cache.GetAsync<PostResponse>(cacheKey);
        if (cached != null) return cached;

        var post = await _repo.GetByIdAsync(id);
        if (post is null) return null;

        var response = MapToResponse(post);
        await _cache.SetAsync(cacheKey, response, TimeSpan.FromMinutes(10));
        return response;
    }

    public async Task<PostResponse?> GetBySlugAsync(string slug)
    {
        var cacheKey = $"post_slug_{slug}";
        var cached = await _cache.GetAsync<PostResponse>(cacheKey);
        if (cached != null) return cached;

        var post = await _repo.GetBySlugAsync(slug);
        if (post is null) return null;

        var response = MapToResponse(post);
        await _cache.SetAsync(cacheKey, response, TimeSpan.FromMinutes(10));
        return response;
    }

    public async Task<PostResponse> CreateAsync(CreatePostRequest req, string userId, string userName)
    {
        var slug = GenerateSlug(req.Title);
        var post = new Post
        {
            Title = req.Title,
            Slug = slug,
            Content = req.Content,
            Summary = req.Summary,
            Tags = req.Tags ?? new(),
            CoverImageUrl = req.CoverImageUrl,
            CreatedBy = userId,
            CreatedByName = userName,
            CreatedAt = DateTime.UtcNow,
            Status = req.Status
        };

        await _repo.CreateAsync(post);
        await InvalidateListCaches();
        return MapToResponse(post);
    }

    public async Task<PostResponse?> UpdateAsync(string id, UpdatePostRequest req, string userId)
    {
        var post = await _repo.GetByIdAsync(id);
        if (post is null) return null;

        post.Title = req.Title;
        post.Slug = GenerateSlug(req.Title);
        post.Content = req.Content;
        post.Summary = req.Summary;
        post.Tags = req.Tags ?? new();
        post.CoverImageUrl = req.CoverImageUrl;
        post.Status = req.Status;
        post.UpdatedBy = userId;
        post.UpdatedAt = DateTime.UtcNow;

        await _repo.UpdateAsync(post);
        await _cache.RemoveAsync($"post_{id}");
        await _cache.RemoveAsync($"post_slug_{post.Slug}");
        await InvalidateListCaches();
        return MapToResponse(post);
    }

    public async Task<bool> DeleteAsync(string id, string userId)
    {
        var post = await _repo.GetByIdAsync(id);
        if (post is null) return false;

        await _repo.DeleteAsync(id);
        await _cache.RemoveAsync($"post_{id}");
        await _cache.RemoveAsync($"post_slug_{post.Slug}");
        await InvalidateListCaches();
        return true;
    }

    public Task IncrementViewAsync(string id) => _repo.IncrementViewCountAsync(id);

    private async Task InvalidateListCaches()
    {
        for (int p = 1; p <= 5; p++)
            for (int s = 10; s <= 50; s += 10)
                await _cache.RemoveAsync($"posts_page_{p}_{s}__");
    }

    private static PostResponse MapToResponse(Post p) => new(
        p.PostId, p.Title, p.Slug, p.Content, p.Summary,
        p.Tags, p.CoverImageUrl, p.CreatedBy, p.CreatedByName,
        p.CreatedAt, p.UpdatedAt, p.Status,
        p.LikeCount, p.DislikeCount, p.CommentCount, p.ViewCount);

    private static string GenerateSlug(string title)
    {
        var slug = title.ToLowerInvariant();
        slug = Regex.Replace(slug, @"[^a-z0-9\s-]", "");
        slug = Regex.Replace(slug, @"\s+", "-");
        slug = slug.Trim('-');
        return slug;
    }
}
