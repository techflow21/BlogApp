namespace BlogApp.Application.DTOs.Posts;

public record PostListResponse(List<PostResponse> Items, int Page, int PageSize, long TotalCount);
