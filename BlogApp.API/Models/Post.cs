using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BlogApp.API.Models
{
    public class Post
    {
        [BsonId, BsonRepresentation(BsonType.ObjectId)]
        public string? PostId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string UpdatedBy { get; set; } = string.Empty;
        public DateTime? UpdatedAt { get; set; }


    }
}
