using BlogApp.Domain.Entities;
using BlogApp.Domain.Interfaces;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;

namespace BlogApp.Infrastructure.Repositories;

public class CommentRepository : ICommentRepository
{
    private readonly IMongoCollection<Comment> _col;
    private readonly ILogger<CommentRepository> _logger;

    public CommentRepository(IMongoDatabase db, ILogger<CommentRepository> logger)
    {
        _col = db.GetCollection<Comment>("Comments");
        _logger = logger;
    }

    public Task<List<Comment>> GetByPostIdAsync(string postId, int page, int pageSize) =>
        _col.Find(c => c.PostId == postId && c.ParentCommentId == null && !c.IsDeleted)
            .SortBy(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Limit(pageSize)
            .ToListAsync();

    public Task<List<Comment>> GetRepliesAsync(string parentCommentId, int page, int pageSize) =>
        _col.Find(c => c.ParentCommentId == parentCommentId && !c.IsDeleted)
            .SortBy(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Limit(pageSize)
            .ToListAsync();

    public Task<Comment?> GetByIdAsync(string id) =>
        _col.Find(c => c.CommentId == id).FirstOrDefaultAsync()!;

    public Task CreateAsync(Comment comment) => _col.InsertOneAsync(comment);

    public Task UpdateAsync(Comment comment) =>
        _col.ReplaceOneAsync(c => c.CommentId == comment.CommentId, comment);

    public Task DeleteAsync(string id) =>
        _col.DeleteOneAsync(c => c.CommentId == id);

    public Task UpdateCountsAsync(string id, int likeDelta, int dislikeDelta, int replyDelta)
    {
        var update = Builders<Comment>.Update
            .Inc(c => c.LikeCount, likeDelta)
            .Inc(c => c.DislikeCount, dislikeDelta)
            .Inc(c => c.ReplyCount, replyDelta);
        return _col.UpdateOneAsync(c => c.CommentId == id, update);
    }

    public Task<long> CountByPostIdAsync(string postId) =>
        _col.CountDocumentsAsync(c => c.PostId == postId && !c.IsDeleted);

    public Task<long> CountAllAsync() =>
        _col.CountDocumentsAsync(c => !c.IsDeleted);
}
