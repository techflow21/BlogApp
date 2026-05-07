using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BlogApp.Domain.Entities;

public class Post
{
    [BsonId, BsonRepresentation(BsonType.ObjectId)]
    public string? PostId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? Summary { get; set; }
    public List<string> Tags { get; set; } = new();
    public string? CoverImageUrl { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public string CreatedByName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? UpdatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public PostStatus Status { get; set; } = PostStatus.Draft;
    public int LikeCount { get; set; }
    public int DislikeCount { get; set; }
    public int CommentCount { get; set; }
    public int ViewCount { get; set; }
}

public enum PostStatus { Draft = 0, Published = 1, Archived = 2 }
