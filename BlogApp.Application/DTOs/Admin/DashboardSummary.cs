namespace BlogApp.Application.DTOs.Admin;

public record DashboardSummary(long TotalUsers, long TotalPosts, long PublishedPosts, long TotalComments, long TotalReactions, long TotalViews);
