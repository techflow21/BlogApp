namespace BlogApp.API.DTOs
{
    public class ResetPasswordRequest
    {
        public string Token { get; internal set; }
        public string NewPassword { get; internal set; }
    }
}
