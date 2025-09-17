namespace BlogApp.API.DTOs
{
    public class RegisterRequest
    {
        public string Email { get; internal set; } = string.Empty;
        public string Password { get; internal set; }= string.Empty;
        public string FullName { get; internal set; } = string.Empty;
    }
}
