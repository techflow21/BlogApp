using BlogApp.Domain.Entities;

namespace BlogApp.Application.Interfaces;

public interface IJwtService
{
    (string token, DateTime expires) CreateAccessToken(User user);
}
