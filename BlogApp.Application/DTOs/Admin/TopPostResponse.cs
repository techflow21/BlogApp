namespace BlogApp.Application.DTOs.Admin;

public record TopPostResponse(string PostId, string Title, string Slug, int LikeCount, int DislikeCount, int CommentCount, int ViewCount);
