using BlogApp.Domain.Entities;

namespace BlogApp.Application.DTOs.Posts;

public record CreatePostRequest(string Title, string Content, string? Summary, List<string>? Tags, string? CoverImageUrl, PostStatus Status);
