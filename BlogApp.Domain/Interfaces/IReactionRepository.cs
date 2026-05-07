using BlogApp.Domain.Entities;

namespace BlogApp.Domain.Interfaces;

public interface IReactionRepository
{
    Task<Reaction?> GetByUserAndPostAsync(string userId, string postId);
    Task<Reaction?> GetByUserAndCommentAsync(string userId, string commentId);
    Task CreateAsync(Reaction reaction);
    Task UpdateAsync(Reaction reaction);
    Task DeleteAsync(string id);
    Task<long> CountLikesForPostAsync(string postId);
    Task<long> CountDislikesForPostAsync(string postId);
    Task<long> CountTotalReactionsAsync();
}
