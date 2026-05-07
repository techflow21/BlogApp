using BlogApp.Domain.Entities;

namespace BlogApp.Application.DTOs.Posts;

public record PostResponse(
    string? PostId,
    string Title,
    string Slug,
    string Content,
    string? Summary,
    List<string> Tags,
    string? CoverImageUrl,
    string CreatedBy,
    string CreatedByName,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    PostStatus Status,
    int LikeCount,
    int DislikeCount,
    int CommentCount,
    int ViewCount
);
