using BlogApp.Application.Interfaces;
using Microsoft.Extensions.Options;

namespace BlogApp.Infrastructure.Services;

public class FileStorageOptions
{
    public string Root { get; set; } = "wwwroot/uploads";
    public string BaseUrl { get; set; } = "https://localhost:5001/uploads";
}

public class FileService : IFileService
{
    private readonly FileStorageOptions _opt;

    public FileService(IOptions<FileStorageOptions> opt)
    {
        _opt = opt.Value;
    }

    public async Task<string> SaveFileAsync(Stream fileStream, string fileName, string userId)
    {
        Directory.CreateDirectory(_opt.Root);
        var ext = Path.GetExtension(fileName);
        var name = $"{userId}-{Guid.NewGuid():N}{ext}";
        var path = Path.Combine(_opt.Root, name);

        using var stream = File.Create(path);
        await fileStream.CopyToAsync(stream);

        return $"{_opt.BaseUrl}/{name}";
    }
}
