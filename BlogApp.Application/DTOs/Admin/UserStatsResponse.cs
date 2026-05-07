namespace BlogApp.Application.DTOs.Admin;

public record UserStatsResponse(long TotalUsers, long ActiveUsers, long UsersRegisteredThisMonth);
