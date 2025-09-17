using Microsoft.Extensions.Options;

namespace BlogApp.API.Services
{
    public class FileStorageOptions
    {
        public string Root { get; set; } = "wwwroot/uploads";
        public string BaseUrl { get; set; } = "https://localhost:5001/uploads";
    }

    public interface IFileService
    {
        Task<string> SaveFileAsync(IFormFile file, string userId);
    }

    public class FileService : IFileService
    {
        private readonly FileStorageOptions _opt;
        private readonly IWebHostEnvironment _env;

        public FileService(IOptions<FileStorageOptions> opt, IWebHostEnvironment env)
        {
            _opt = opt.Value;
            _env = env;
        }

        public async Task<string> SaveFileAsync(IFormFile file, string userId)
        {
            Directory.CreateDirectory(Path.Combine(_env.ContentRootPath, _opt.Root));
            var ext = Path.GetExtension(file.FileName);
            var name = $"{userId}-{Guid.NewGuid():N}{ext}";
            var path = Path.Combine(_env.ContentRootPath, _opt.Root, name);

            using var stream = File.Create(path);
            await file.CopyToAsync(stream);

            return $"{_opt.BaseUrl}/{name}";
        }
    }

}
