using BlogApp.API.Interfaces;
using BlogApp.API.Models;
using BlogApp.API.Services;
using MongoDB.Driver;

namespace BlogApp.API.Repository
{
    public class PostRepository
    {
        private readonly IMongoCollection<Post> _col;
        private readonly ICacheService _cache;
        private readonly ILogger<PostRepository> _logger;
        public PostRepository(IMongoDatabase db, ICacheService cache, ILogger<PostRepository> logger)
        {
            _col = db.GetCollection<Post>("Posts");
            _cache = cache;
            _logger = logger;
        }

        public async Task<List<Post>> GetPostsAsync()
        {
            string cacheKey = "posts_all";

            var cached = await _cache.GetAsync<List<Post>>(cacheKey);
            if (cached != null)
            {
                _logger.LogInformation("Cache hit for {CacheKey}", cacheKey);
                return cached;
            }

            var posts = await _col.Find(_ => true).SortByDescending(p => p.CreatedAt).ToListAsync();
            await _cache.SetAsync(cacheKey, posts);

            _logger.LogInformation("Cache set for {CacheKey} with {Count} posts", cacheKey, posts.Count);
            return posts;
        }

        public async Task<Post?> GetPostAsync(string id)
        {
            string cacheKey = $"post_{id}";

            var cached = await _cache.GetAsync<Post>(cacheKey);
            if (cached != null)
            {
                _logger.LogInformation("Cache hit for {CacheKey}", cacheKey);
                return cached;
            }

            var post = await _col.Find(x => x.PostId == id).FirstOrDefaultAsync();
            if (post != null)
                await _cache.SetAsync(cacheKey, post);

            _logger.LogInformation("Fetched post {PostId} from DB", id);
            return post;
        }

        public async Task CreatePostAsync(Post post)
        {
            post.CreatedAt = DateTime.UtcNow;
            post.CreatedBy = "admin";
            await _col.InsertOneAsync(post);

            await _cache.RemoveAsync("posts_all");
            _logger.LogInformation("Created post {PostId} and invalidated cache", post.PostId);
        }

        public async Task UpdatePostAsync(Post post)
        {
            post.UpdatedAt = DateTime.UtcNow;
            post.UpdatedBy = "admin-update";
            await _col.ReplaceOneAsync(x => x.PostId == post.PostId, post);

            await _cache.RemoveAsync("posts_all");
            await _cache.RemoveAsync($"post_{post.PostId}");
            _logger.LogInformation("Updated post {PostId} and invalidated caches", post.PostId);
        }

        public async Task DeletePostAsync(string id)
        {
            await _col.DeleteOneAsync(x => x.PostId == id);

            await _cache.RemoveAsync("posts_all");
            await _cache.RemoveAsync($"post_{id}");
            _logger.LogInformation("Deleted post {PostId} and invalidated caches", id);
        }
    }
}
