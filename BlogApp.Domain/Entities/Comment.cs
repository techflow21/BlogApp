using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BlogApp.Domain.Entities;

public class Comment
{
    [BsonId, BsonRepresentation(BsonType.ObjectId)]
    public string? CommentId { get; set; }
    public string PostId { get; set; } = default!;
    public string? ParentCommentId { get; set; }
    public string AuthorId { get; set; } = default!;
    public string AuthorName { get; set; } = default!;
    public string? AuthorImageUrl { get; set; }
    public string Content { get; set; } = default!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public bool IsDeleted { get; set; }
    public int LikeCount { get; set; }
    public int DislikeCount { get; set; }
    public int ReplyCount { get; set; }
}
