using BlogApp.Domain.Entities;

namespace BlogApp.Application.DTOs.Reactions;

public record ReactionResult(bool Reacted, ReactionType? CurrentReaction, int LikeCount, int DislikeCount);
