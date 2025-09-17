namespace BlogApp.API.Models
{
    public class EmailConfirmationToken
    {
        public string Id { get; set; } = Guid.NewGuid().ToString("N");
        public string UserId { get; set; } = default!;
        public string Token { get; set; } = Guid.NewGuid().ToString("N");
        public DateTime ExpiresAt { get; set; } = DateTime.UtcNow.AddHours(24);
        public bool Used { get; set; }
    }
}
