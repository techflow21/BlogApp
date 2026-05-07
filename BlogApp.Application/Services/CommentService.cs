using BlogApp.Application.DTOs.Comments;
using BlogApp.Application.Interfaces;
using BlogApp.Domain.Entities;
using BlogApp.Domain.Interfaces;

namespace BlogApp.Application.Services;

public class CommentService : ICommentService
{
    private readonly ICommentRepository _commentRepo;
    private readonly IPostRepository _postRepo;

    public CommentService(ICommentRepository commentRepo, IPostRepository postRepo)
    {
        _commentRepo = commentRepo;
        _postRepo = postRepo;
    }

    public async Task<List<CommentResponse>> GetCommentsAsync(string postId, int page, int pageSize)
    {
        var comments = await _commentRepo.GetByPostIdAsync(postId, page, pageSize);
        return comments.Select(MapToResponse).ToList();
    }

    public async Task<List<CommentResponse>> GetRepliesAsync(string commentId, int page, int pageSize)
    {
        var replies = await _commentRepo.GetRepliesAsync(commentId, page, pageSize);
        return replies.Select(MapToResponse).ToList();
    }

    public async Task<CommentResponse> AddCommentAsync(CreateCommentRequest req, string authorId, string authorName, string? authorImageUrl)
    {
        var comment = new Comment
        {
            PostId = req.PostId,
            ParentCommentId = req.ParentCommentId,
            AuthorId = authorId,
            AuthorName = authorName,
            AuthorImageUrl = authorImageUrl,
            Content = req.Content,
            CreatedAt = DateTime.UtcNow
        };

        await _commentRepo.CreateAsync(comment);

        await _postRepo.UpdateCountsAsync(req.PostId, 0, 0, 1);

        if (!string.IsNullOrEmpty(req.ParentCommentId))
            await _commentRepo.UpdateCountsAsync(req.ParentCommentId, 0, 0, 1);

        return MapToResponse(comment);
    }

    public async Task<CommentResponse?> UpdateCommentAsync(string commentId, UpdateCommentRequest req, string userId)
    {
        var comment = await _commentRepo.GetByIdAsync(commentId);
        if (comment is null || comment.AuthorId != userId) return null;

        comment.Content = req.Content;
        comment.UpdatedAt = DateTime.UtcNow;
        await _commentRepo.UpdateAsync(comment);
        return MapToResponse(comment);
    }

    public async Task<bool> DeleteCommentAsync(string commentId, string userId, bool isAdmin)
    {
        var comment = await _commentRepo.GetByIdAsync(commentId);
        if (comment is null) return false;
        if (!isAdmin && comment.AuthorId != userId) return false;

        comment.IsDeleted = true;
        comment.UpdatedAt = DateTime.UtcNow;
        await _commentRepo.UpdateAsync(comment);

        await _postRepo.UpdateCountsAsync(comment.PostId, 0, 0, -1);

        return true;
    }

    private static CommentResponse MapToResponse(Comment c) => new(
        c.CommentId, c.PostId, c.ParentCommentId,
        c.AuthorId, c.AuthorName, c.AuthorImageUrl,
        c.Content, c.CreatedAt, c.UpdatedAt,
        c.LikeCount, c.DislikeCount, c.ReplyCount, c.IsDeleted);
}
