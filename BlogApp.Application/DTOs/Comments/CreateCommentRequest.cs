namespace BlogApp.Application.DTOs.Comments;

public record CreateCommentRequest(string PostId, string? ParentCommentId, string Content);
