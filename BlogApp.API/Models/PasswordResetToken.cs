namespace BlogApp.API.Models
{
    public class PasswordResetToken
    {
        public string Id { get; set; } = Guid.NewGuid().ToString("N");
        public string UserId { get; set; } = default!;
        public string Token { get; set; } = Guid.NewGuid().ToString("N");
        public DateTime ExpiresAt { get; set; } = DateTime.UtcNow.AddHours(2);
        public bool Used { get; set; }
    }
}
