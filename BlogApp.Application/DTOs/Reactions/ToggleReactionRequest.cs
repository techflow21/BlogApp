using BlogApp.Domain.Entities;

namespace BlogApp.Application.DTOs.Reactions;

public record ToggleReactionRequest(ReactionType Type);
