using BlogApp.Domain.Entities;

namespace BlogApp.Application.DTOs.Posts;

public record UpdatePostRequest(string Title, string Content, string? Summary, List<string>? Tags, string? CoverImageUrl, PostStatus Status);
