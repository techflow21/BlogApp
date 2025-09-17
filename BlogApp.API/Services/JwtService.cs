using BlogApp.API.Models;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace BlogApp.API.Services
{
    public class JwtOptions
    {
        public string Issuer { get; set; } = default!;
        public string Audience { get; set; } = default!;
        public string Key { get; set; } = default!;
        public int AccessTokenMinutes { get; set; } = 60;
    }

    public interface IJwtService
    {
        (string token, DateTime expires) CreateAccessToken(User user);
    }

    public class JwtService : IJwtService
    {
        private readonly JwtOptions _opt;
        public JwtService(IOptions<JwtOptions> opt) => _opt = opt.Value;

        public (string token, DateTime expires) CreateAccessToken(User user)
        {
            var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new("uid", user.Id)
        };

            // Roles
            claims.AddRange(user.Roles.Select(r => new Claim(ClaimTypes.Role, r)));

            // Custom Claims
            claims.AddRange(user.Claims.Select(kv => new Claim(kv.Key, kv.Value)));

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_opt.Key));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var expires = DateTime.UtcNow.AddMinutes(_opt.AccessTokenMinutes);

            var jwt = new JwtSecurityToken(
                issuer: _opt.Issuer,
                audience: _opt.Audience,
                claims: claims,
                notBefore: DateTime.UtcNow,
                expires: expires,
                signingCredentials: creds);

            var token = new JwtSecurityTokenHandler().WriteToken(jwt);
            return (token, expires);
        }
    }

}
