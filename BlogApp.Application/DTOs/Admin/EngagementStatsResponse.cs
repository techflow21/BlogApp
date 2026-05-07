namespace BlogApp.Application.DTOs.Admin;

public record EngagementStatsResponse(long TotalReactions, long TotalComments, double AvgCommentsPerPost);
