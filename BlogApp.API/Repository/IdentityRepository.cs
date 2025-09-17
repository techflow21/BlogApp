using BlogApp.API.Interfaces;
using BlogApp.API.Models;
using MongoDB.Driver;

namespace BlogApp.API.Repository
{
    public class IdentityRepository : IIdentityRepository
    {
        private readonly IMongoCollection<User> _users;
        private readonly IMongoCollection<EmailConfirmationToken> _emailTokens;
        private readonly IMongoCollection<PasswordResetToken> _resetTokens;
        private readonly ILogger<IdentityRepository> _logger;
 
        public IdentityRepository(IMongoDatabase db, ILogger<IdentityRepository> logger)
        {
            _users = db.GetCollection<User>("Users");
            _emailTokens = db.GetCollection<EmailConfirmationToken>("EmailTokens");
            _resetTokens = db.GetCollection<PasswordResetToken>("PasswordResetTokens");
            _logger = logger;
        }

        public Task<User?> FindByEmailAsync(string email) =>
            _users.Find(u => u.NormalizedEmail == email.ToUpper()).FirstOrDefaultAsync()!;

        public Task<User?> FindByIdAsync(string id) =>
            _users.Find(u => u.Id == id).FirstOrDefaultAsync()!;

        public Task CreateAsync(User u) => _users.InsertOneAsync(u);

        public Task UpdateAsync(User u) =>
            _users.ReplaceOneAsync(x => x.Id == u.Id, u);

        public Task CreateEmailTokenAsync(EmailConfirmationToken t) => _emailTokens.InsertOneAsync(t);
        public Task<EmailConfirmationToken?> GetEmailTokenAsync(string token) =>
            _emailTokens.Find(t => t.Token == token && !t.Used && t.ExpiresAt > DateTime.UtcNow).FirstOrDefaultAsync()!;

        public Task UpdateEmailTokenAsync(EmailConfirmationToken t) =>
            _emailTokens.ReplaceOneAsync(x => x.Id == t.Id, t);

        public Task CreateResetTokenAsync(PasswordResetToken t) => _resetTokens.InsertOneAsync(t);
        public Task<PasswordResetToken?> GetResetTokenAsync(string token) =>
            _resetTokens.Find(t => t.Token == token && !t.Used && t.ExpiresAt > DateTime.UtcNow).FirstOrDefaultAsync()!;

        public Task UpdateResetTokenAsync(PasswordResetToken t) =>
            _resetTokens.ReplaceOneAsync(x => x.Id == t.Id, t);

    }
}
