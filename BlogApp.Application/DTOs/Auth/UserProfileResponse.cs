namespace BlogApp.Application.DTOs.Auth;

public record UserProfileResponse(string Id, string Email, string? FullName, string? ProfileImageUrl, string? Bio, List<string> Roles, Dictionary<string, string> Claims);
