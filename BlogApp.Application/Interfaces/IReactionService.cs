using BlogApp.Application.DTOs.Reactions;
using BlogApp.Domain.Entities;

namespace BlogApp.Application.Interfaces;

public interface IReactionService
{
    Task<ReactionResult> TogglePostReactionAsync(string postId, string userId, ReactionType type);
    Task<ReactionResult> ToggleCommentReactionAsync(string commentId, string userId, ReactionType type);
    Task<ReactionResult> GetPostReactionAsync(string postId, string userId);
    Task<ReactionResult> GetCommentReactionAsync(string commentId, string userId);
}
