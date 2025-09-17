using BlogApp.API.Models;

namespace BlogApp.API.Interfaces
{
    public interface IIdentityRepository
    {
        Task<User?> FindByEmailAsync(string email);
        Task<User?> FindByIdAsync(string id);
        Task CreateAsync(User u);
        Task UpdateAsync(User u);
        Task CreateEmailTokenAsync(EmailConfirmationToken t);
        Task<EmailConfirmationToken?> GetEmailTokenAsync(string token);
        Task UpdateEmailTokenAsync(EmailConfirmationToken t);
        Task CreateResetTokenAsync(PasswordResetToken t);
        Task<PasswordResetToken?> GetResetTokenAsync(string token);
        Task UpdateResetTokenAsync(PasswordResetToken t);
    }
}
