using BlogApp.Application.Interfaces;
using Google.Apis.Auth.OAuth2;
using Google.Cloud.Storage.V1;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace BlogApp.Infrastructure.Services;

public class FileStorageOptions
{
    public string Root { get; set; } = "wwwroot/uploads";
    public string? BaseUrl { get; set; }
}

public class FirebaseStorageOptions
{
    public string? ServiceAccountKeyPath { get; set; }
    public string? StorageBucket { get; set; }
}

public class FileService : IFileService, IDisposable
{
    private readonly FileStorageOptions _localOpt;
    private readonly FirebaseStorageOptions _firebaseOpt;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ILogger<FileService> _logger;

    private StorageClient? _storageClientCache;
    private readonly SemaphoreSlim _storageLock = new(1, 1);
    private bool _disposed;

    public FileService(
        IOptions<FileStorageOptions> localOpt,
        IOptions<FirebaseStorageOptions> firebaseOpt,
        IHttpContextAccessor httpContextAccessor,
        ILogger<FileService> logger)
    {
        _localOpt = localOpt.Value;
        _firebaseOpt = firebaseOpt.Value;
        _httpContextAccessor = httpContextAccessor;
        _logger = logger;
    }

    public async Task<string> SaveFileAsync(Stream fileStream, string fileName, string userId)
    {
        var ext = Path.GetExtension(fileName).ToLowerInvariant();
        var uniqueName = $"{userId}-{Guid.NewGuid():N}{ext}";

        if (!string.IsNullOrWhiteSpace(_firebaseOpt.StorageBucket))
        {
            try
            {
                return await UploadToFirebaseAsync(fileStream, uniqueName);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Firebase upload failed, falling back to local storage");

                if (!fileStream.CanSeek)
                {
                    _logger.LogError("Stream is not seekable; cannot fall back to local storage after Firebase failure");
                    throw;
                }

                fileStream.Seek(0, SeekOrigin.Begin);
            }
        }

        return await SaveLocallyAsync(fileStream, uniqueName);
    }

    private async Task<string> UploadToFirebaseAsync(Stream fileStream, string uniqueName)
    {
        var client = await GetStorageClientAsync();
        var objectName = $"uploads/{uniqueName}";
        var contentType = GetContentType(uniqueName);

        await client.UploadObjectAsync(
            _firebaseOpt.StorageBucket,
            objectName,
            contentType,
            fileStream,
            new UploadObjectOptions { PredefinedAcl = PredefinedObjectAcl.PublicRead });

        return $"https://storage.googleapis.com/{_firebaseOpt.StorageBucket}/{objectName}";
    }

    private async Task<StorageClient> GetStorageClientAsync()
    {
        if (_storageClientCache is not null) return _storageClientCache;

        await _storageLock.WaitAsync();
        try
        {
            if (_storageClientCache is not null) return _storageClientCache;

            var keyPath = _firebaseOpt.ServiceAccountKeyPath;
            if (!string.IsNullOrWhiteSpace(keyPath) && File.Exists(keyPath))
            {
                var json = await File.ReadAllTextAsync(keyPath);
                // GoogleCredential.FromJson is suppressed: GoogleCredential static helpers are deprecated in
                // favour of CredentialFactory, but CredentialFactory is a static class without a usable
                // instance factory path for JSON streams in the current SDK version.
#pragma warning disable CS0618
                var credential = GoogleCredential.FromJson(json);
#pragma warning restore CS0618
                _storageClientCache = await StorageClient.CreateAsync(credential);
            }
            else
            {
                _storageClientCache = await StorageClient.CreateAsync();
            }

            return _storageClientCache;
        }
        finally
        {
            _storageLock.Release();
        }
    }

    private async Task<string> SaveLocallyAsync(Stream fileStream, string uniqueName)
    {
        var root = Path.IsPathRooted(_localOpt.Root)
            ? _localOpt.Root
            : Path.Combine(Directory.GetCurrentDirectory(), _localOpt.Root);

        Directory.CreateDirectory(root);
        var filePath = Path.Combine(root, uniqueName);

        using var fs = File.Create(filePath);
        await fileStream.CopyToAsync(fs);

        return BuildLocalUrl(uniqueName);
    }

    private string BuildLocalUrl(string uniqueName)
    {
        var ctx = _httpContextAccessor.HttpContext;
        if (ctx is not null)
        {
            var req = ctx.Request;
            return $"{req.Scheme}://{req.Host}/uploads/{uniqueName}";
        }

        var baseUrl = (_localOpt.BaseUrl ?? "").TrimEnd('/');
        return string.IsNullOrEmpty(baseUrl)
            ? $"/uploads/{uniqueName}"
            : $"{baseUrl}/uploads/{uniqueName}";
    }

    private static string GetContentType(string fileName) =>
        Path.GetExtension(fileName).ToLowerInvariant() switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            ".webp" => "image/webp",
            _ => "application/octet-stream"
        };

    public void Dispose()
    {
        if (_disposed) return;
        _storageLock.Dispose();
        _storageClientCache?.Dispose();
        _disposed = true;
    }
}
