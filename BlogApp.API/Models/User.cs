using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BlogApp.API.Models
{
    public class User
    {
        [BsonId, BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = default!;
        public string Email { get; set; } = default!;
        public string NormalizedEmail { get; set; } = default!;
        public string PasswordHash { get; set; } = default!;
        public bool EmailConfirmed { get; set; }
        public string? FullName { get; set; }
        public string? ProfileImageUrl { get; set; }
        public List<string> Roles { get; set; } = new();
        public Dictionary<string, string> Claims { get; set; } = new();
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
