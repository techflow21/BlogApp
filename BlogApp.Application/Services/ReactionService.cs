using BlogApp.Application.DTOs.Reactions;
using BlogApp.Application.Interfaces;
using BlogApp.Domain.Entities;
using BlogApp.Domain.Interfaces;

namespace BlogApp.Application.Services;

public class ReactionService : IReactionService
{
    private readonly IReactionRepository _reactionRepo;
    private readonly IPostRepository _postRepo;
    private readonly ICommentRepository _commentRepo;

    public ReactionService(IReactionRepository reactionRepo, IPostRepository postRepo, ICommentRepository commentRepo)
    {
        _reactionRepo = reactionRepo;
        _postRepo = postRepo;
        _commentRepo = commentRepo;
    }

    public async Task<ReactionResult> TogglePostReactionAsync(string postId, string userId, ReactionType type)
    {
        var existing = await _reactionRepo.GetByUserAndPostAsync(userId, postId);

        if (existing is null)
        {
            var reaction = new Reaction { UserId = userId, PostId = postId, Type = type };
            await _reactionRepo.CreateAsync(reaction);
            int likeDelta = type == ReactionType.Like ? 1 : 0;
            int dislikeDelta = type == ReactionType.Dislike ? 1 : 0;
            await _postRepo.UpdateCountsAsync(postId, likeDelta, dislikeDelta, 0);
        }
        else if (existing.Type == type)
        {
            await _reactionRepo.DeleteAsync(existing.ReactionId!);
            int likeDelta = type == ReactionType.Like ? -1 : 0;
            int dislikeDelta = type == ReactionType.Dislike ? -1 : 0;
            await _postRepo.UpdateCountsAsync(postId, likeDelta, dislikeDelta, 0);
        }
        else
        {
            existing.Type = type;
            await _reactionRepo.UpdateAsync(existing);
            int likeDelta = type == ReactionType.Like ? 1 : -1;
            int dislikeDelta = type == ReactionType.Dislike ? 1 : -1;
            await _postRepo.UpdateCountsAsync(postId, likeDelta, dislikeDelta, 0);
        }

        var post = await _postRepo.GetByIdAsync(postId);
        var currentReaction = await _reactionRepo.GetByUserAndPostAsync(userId, postId);
        return new ReactionResult(
            currentReaction != null,
            currentReaction?.Type,
            post?.LikeCount ?? 0,
            post?.DislikeCount ?? 0);
    }

    public async Task<ReactionResult> ToggleCommentReactionAsync(string commentId, string userId, ReactionType type)
    {
        var existing = await _reactionRepo.GetByUserAndCommentAsync(userId, commentId);

        if (existing is null)
        {
            var reaction = new Reaction { UserId = userId, CommentId = commentId, Type = type };
            await _reactionRepo.CreateAsync(reaction);
            int likeDelta = type == ReactionType.Like ? 1 : 0;
            int dislikeDelta = type == ReactionType.Dislike ? 1 : 0;
            await _commentRepo.UpdateCountsAsync(commentId, likeDelta, dislikeDelta, 0);
        }
        else if (existing.Type == type)
        {
            await _reactionRepo.DeleteAsync(existing.ReactionId!);
            int likeDelta = type == ReactionType.Like ? -1 : 0;
            int dislikeDelta = type == ReactionType.Dislike ? -1 : 0;
            await _commentRepo.UpdateCountsAsync(commentId, likeDelta, dislikeDelta, 0);
        }
        else
        {
            existing.Type = type;
            await _reactionRepo.UpdateAsync(existing);
            int likeDelta = type == ReactionType.Like ? 1 : -1;
            int dislikeDelta = type == ReactionType.Dislike ? 1 : -1;
            await _commentRepo.UpdateCountsAsync(commentId, likeDelta, dislikeDelta, 0);
        }

        var comment = await _commentRepo.GetByIdAsync(commentId);
        var currentReaction = await _reactionRepo.GetByUserAndCommentAsync(userId, commentId);
        return new ReactionResult(
            currentReaction != null,
            currentReaction?.Type,
            comment?.LikeCount ?? 0,
            comment?.DislikeCount ?? 0);
    }

    public async Task<ReactionResult> GetPostReactionAsync(string postId, string userId)
    {
        var post = await _postRepo.GetByIdAsync(postId);
        var reaction = await _reactionRepo.GetByUserAndPostAsync(userId, postId);
        return new ReactionResult(reaction != null, reaction?.Type, post?.LikeCount ?? 0, post?.DislikeCount ?? 0);
    }

    public async Task<ReactionResult> GetCommentReactionAsync(string commentId, string userId)
    {
        var comment = await _commentRepo.GetByIdAsync(commentId);
        var reaction = await _reactionRepo.GetByUserAndCommentAsync(userId, commentId);
        return new ReactionResult(reaction != null, reaction?.Type, comment?.LikeCount ?? 0, comment?.DislikeCount ?? 0);
    }
}
