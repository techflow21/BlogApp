using BlogApp.Domain.Entities;

namespace BlogApp.Domain.Interfaces;

public interface ICommentRepository
{
    Task<List<Comment>> GetByPostIdAsync(string postId, int page, int pageSize);
    Task<List<Comment>> GetRepliesAsync(string parentCommentId, int page, int pageSize);
    Task<Comment?> GetByIdAsync(string id);
    Task CreateAsync(Comment comment);
    Task UpdateAsync(Comment comment);
    Task DeleteAsync(string id);
    Task UpdateCountsAsync(string id, int likeDelta, int dislikeDelta, int replyDelta);
    Task<long> CountByPostIdAsync(string postId);
    Task<long> CountAllAsync();
}
