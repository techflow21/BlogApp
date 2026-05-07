using BlogApp.Application.DTOs.Posts;

namespace BlogApp.Application.Interfaces;

public interface IPostService
{
    Task<PostListResponse> GetAllAsync(int page, int pageSize, string? tag, string? status);
    Task<PostResponse?> GetByIdAsync(string id);
    Task<PostResponse?> GetBySlugAsync(string slug);
    Task<PostResponse> CreateAsync(CreatePostRequest req, string userId, string userName);
    Task<PostResponse?> UpdateAsync(string id, UpdatePostRequest req, string userId);
    Task<bool> DeleteAsync(string id, string userId);
    Task IncrementViewAsync(string id);
}
