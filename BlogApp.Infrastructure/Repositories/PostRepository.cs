using BlogApp.Domain.Entities;
using BlogApp.Domain.Interfaces;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;

namespace BlogApp.Infrastructure.Repositories;

public class PostRepository : IPostRepository
{
    private readonly IMongoCollection<Post> _col;
    private readonly ILogger<PostRepository> _logger;

    public PostRepository(IMongoDatabase db, ILogger<PostRepository> logger)
    {
        _col = db.GetCollection<Post>("Posts");
        _logger = logger;
    }

    public async Task<List<Post>> GetAllAsync(int page, int pageSize, string? tag = null, string? status = null)
    {
        var filter = BuildFilter(tag, status);
        return await _col.Find(filter)
            .SortByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Limit(pageSize)
            .ToListAsync();
    }

    public Task<Post?> GetByIdAsync(string id) =>
        _col.Find(p => p.PostId == id).FirstOrDefaultAsync()!;

    public Task<Post?> GetBySlugAsync(string slug) =>
        _col.Find(p => p.Slug == slug).FirstOrDefaultAsync()!;

    public Task CreateAsync(Post post) => _col.InsertOneAsync(post);

    public Task UpdateAsync(Post post) =>
        _col.ReplaceOneAsync(p => p.PostId == post.PostId, post);

    public Task DeleteAsync(string id) =>
        _col.DeleteOneAsync(p => p.PostId == id);

    public Task IncrementViewCountAsync(string id)
    {
        var update = Builders<Post>.Update.Inc(p => p.ViewCount, 1);
        return _col.UpdateOneAsync(p => p.PostId == id, update);
    }

    public Task UpdateCountsAsync(string id, int likeDelta, int dislikeDelta, int commentDelta)
    {
        var update = Builders<Post>.Update
            .Inc(p => p.LikeCount, likeDelta)
            .Inc(p => p.DislikeCount, dislikeDelta)
            .Inc(p => p.CommentCount, commentDelta);
        return _col.UpdateOneAsync(p => p.PostId == id, update);
    }

    public Task<long> CountAllAsync() => _col.CountDocumentsAsync(_ => true);

    public Task<long> CountByStatusAsync(PostStatus status) =>
        _col.CountDocumentsAsync(p => p.Status == status);

    public Task<List<Post>> GetTopByViewsAsync(int count) =>
        _col.Find(_ => true).SortByDescending(p => p.ViewCount).Limit(count).ToListAsync();

    public Task<List<Post>> GetTopByLikesAsync(int count) =>
        _col.Find(_ => true).SortByDescending(p => p.LikeCount).Limit(count).ToListAsync();

    public Task<List<Post>> GetRecentAsync(int count) =>
        _col.Find(_ => true).SortByDescending(p => p.CreatedAt).Limit(count).ToListAsync();

    private static FilterDefinition<Post> BuildFilter(string? tag, string? status)
    {
        var builder = Builders<Post>.Filter;
        var filter = builder.Empty;

        if (!string.IsNullOrEmpty(tag))
            filter &= builder.AnyEq(p => p.Tags, tag);

        if (!string.IsNullOrEmpty(status) && Enum.TryParse<PostStatus>(status, true, out var statusEnum))
            filter &= builder.Eq(p => p.Status, statusEnum);

        return filter;
    }
}
