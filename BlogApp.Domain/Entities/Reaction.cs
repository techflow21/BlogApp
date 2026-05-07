using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BlogApp.Domain.Entities;

public class Reaction
{
    [BsonId, BsonRepresentation(BsonType.ObjectId)]
    public string? ReactionId { get; set; }
    public string UserId { get; set; } = default!;
    public string? PostId { get; set; }
    public string? CommentId { get; set; }
    public ReactionType Type { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public enum ReactionType { Like = 1, Dislike = 2 }
