using BlogApp.Domain.Entities;
using BlogApp.Domain.Interfaces;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;

namespace BlogApp.Infrastructure.Repositories;

public class ReactionRepository : IReactionRepository
{
    private readonly IMongoCollection<Reaction> _col;
    private readonly ILogger<ReactionRepository> _logger;

    public ReactionRepository(IMongoDatabase db, ILogger<ReactionRepository> logger)
    {
        _col = db.GetCollection<Reaction>("Reactions");
        _logger = logger;
    }

    public Task<Reaction?> GetByUserAndPostAsync(string userId, string postId) =>
        _col.Find(r => r.UserId == userId && r.PostId == postId).FirstOrDefaultAsync()!;

    public Task<Reaction?> GetByUserAndCommentAsync(string userId, string commentId) =>
        _col.Find(r => r.UserId == userId && r.CommentId == commentId).FirstOrDefaultAsync()!;

    public Task CreateAsync(Reaction reaction) => _col.InsertOneAsync(reaction);

    public Task UpdateAsync(Reaction reaction) =>
        _col.ReplaceOneAsync(r => r.ReactionId == reaction.ReactionId, reaction);

    public Task DeleteAsync(string id) =>
        _col.DeleteOneAsync(r => r.ReactionId == id);

    public Task<long> CountLikesForPostAsync(string postId) =>
        _col.CountDocumentsAsync(r => r.PostId == postId && r.Type == ReactionType.Like);

    public Task<long> CountDislikesForPostAsync(string postId) =>
        _col.CountDocumentsAsync(r => r.PostId == postId && r.Type == ReactionType.Dislike);

    public Task<long> CountTotalReactionsAsync() =>
        _col.CountDocumentsAsync(_ => true);
}
