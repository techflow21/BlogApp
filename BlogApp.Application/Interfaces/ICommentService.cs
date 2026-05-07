using BlogApp.Application.DTOs.Comments;

namespace BlogApp.Application.Interfaces;

public interface ICommentService
{
    Task<List<CommentResponse>> GetCommentsAsync(string postId, int page, int pageSize);
    Task<List<CommentResponse>> GetRepliesAsync(string commentId, int page, int pageSize);
    Task<CommentResponse> AddCommentAsync(CreateCommentRequest req, string authorId, string authorName, string? authorImageUrl);
    Task<CommentResponse?> UpdateCommentAsync(string commentId, UpdateCommentRequest req, string userId);
    Task<bool> DeleteCommentAsync(string commentId, string userId, bool isAdmin);
}
