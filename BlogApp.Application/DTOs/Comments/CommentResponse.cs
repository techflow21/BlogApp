namespace BlogApp.Application.DTOs.Comments;

public record CommentResponse(
    string? CommentId,
    string PostId,
    string? ParentCommentId,
    string AuthorId,
    string AuthorName,
    string? AuthorImageUrl,
    string Content,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    int LikeCount,
    int DislikeCount,
    int ReplyCount,
    bool IsDeleted
);
