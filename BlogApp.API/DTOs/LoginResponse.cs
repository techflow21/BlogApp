
namespace BlogApp.API.DTOs
{
    public class LoginResponse
    {
        private string token;
        private DateTime exp;
        private string id;
        private string email;

        public LoginResponse(string token, DateTime exp, string id, string email)
        {
            this.token = token;
            this.exp = exp;
            this.id = id;
            this.email = email;
        }
    }
}
