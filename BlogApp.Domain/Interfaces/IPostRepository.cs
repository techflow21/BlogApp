using BlogApp.Domain.Entities;

namespace BlogApp.Domain.Interfaces;

public interface IPostRepository
{
    Task<List<Post>> GetAllAsync(int page, int pageSize, string? tag = null, string? status = null);
    Task<Post?> GetByIdAsync(string id);
    Task<Post?> GetBySlugAsync(string slug);
    Task CreateAsync(Post post);
    Task UpdateAsync(Post post);
    Task DeleteAsync(string id);
    Task IncrementViewCountAsync(string id);
    Task UpdateCountsAsync(string id, int likeDelta, int dislikeDelta, int commentDelta);
    Task<long> CountAllAsync();
    Task<long> CountByStatusAsync(PostStatus status);
    Task<List<Post>> GetTopByViewsAsync(int count);
    Task<List<Post>> GetTopByLikesAsync(int count);
    Task<List<Post>> GetRecentAsync(int count);
}
