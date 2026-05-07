using BlogApp.Domain.Entities;

namespace BlogApp.Domain.Interfaces;

public interface IIdentityRepository
{
    Task<User?> FindByEmailAsync(string email);
    Task<User?> FindByIdAsync(string id);
    Task CreateAsync(User u);
    Task UpdateAsync(User u);
    Task<long> CountAllAsync();
    Task<long> CountActiveAsync();
    Task<long> CountRegisteredSinceAsync(DateTime since);
    Task CreateEmailTokenAsync(EmailConfirmationToken t);
    Task<EmailConfirmationToken?> GetEmailTokenAsync(string token);
    Task UpdateEmailTokenAsync(EmailConfirmationToken t);
    Task CreateResetTokenAsync(PasswordResetToken t);
    Task<PasswordResetToken?> GetResetTokenAsync(string token);
    Task UpdateResetTokenAsync(PasswordResetToken t);
}
