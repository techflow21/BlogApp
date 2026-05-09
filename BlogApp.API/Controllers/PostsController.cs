using BlogApp.Application.DTOs.Posts;
using BlogApp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Text;

namespace BlogApp.API.Controllers;

[ApiController]
[Route("api/posts")]
public class PostsController : ControllerBase
{
    private readonly IPostService _posts;
    private readonly IFileService _fileService;
    private const long MaxImageSizeBytes = 5 * 1024 * 1024;
    private static readonly HashSet<string> AllowedImageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    private static readonly HashSet<string> AllowedImageContentTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    private static readonly Dictionary<string, List<byte[]>> FileSignatures = new()
    {
        [".jpg"] = [new byte[] { 0xFF, 0xD8, 0xFF }],
        [".jpeg"] = [new byte[] { 0xFF, 0xD8, 0xFF }],
        [".png"] = [new byte[] { 0x89, 0x50, 0x4E, 0x47 }],
        [".gif"] = [Encoding.ASCII.GetBytes("GIF87a"), Encoding.ASCII.GetBytes("GIF89a")],
        [".webp"] = [Encoding.ASCII.GetBytes("RIFF")]
    };

    public PostsController(IPostService posts, IFileService fileService)
    {
        _posts = posts;
        _fileService = fileService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? tag = null,
        [FromQuery] string? status = null)
    {
        var result = await _posts.GetAllAsync(page, pageSize, tag, status);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var post = await _posts.GetByIdAsync(id);
        if (post is null) return NotFound();
        await _posts.IncrementViewAsync(id);
        return Ok(post);
    }

    [HttpGet("slug/{slug}")]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        var post = await _posts.GetBySlugAsync(slug);
        if (post is null) return NotFound();
        return Ok(post);
    }

    [Authorize]
    [HttpPost]
    [Consumes("application/json")]
    public async Task<IActionResult> Create([FromBody] CreatePostRequest req)
    {
        var userId = User.FindFirstValue("uid")!;
        var userName = User.FindFirstValue(ClaimTypes.Email) ?? userId;
        var post = await _posts.CreateAsync(req, userId, userName);
        return CreatedAtAction(nameof(GetById), new { id = post.PostId }, post);
    }

    [Authorize]
    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> CreateWithImage([FromForm] CreatePostFormRequest req)
    {
        var userId = User.FindFirstValue("uid")!;
        var userName = User.FindFirstValue(ClaimTypes.Email) ?? userId;
        var coverImageUrl = req.CoverImageUrl;

        if (req.CoverImage is not null)
        {
            var validationError = await ValidateImageAsync(req.CoverImage);
            if (validationError is not null)
                return BadRequest(validationError);

            await using var imageStream = req.CoverImage.OpenReadStream();
            coverImageUrl = await _fileService.SaveFileAsync(imageStream, req.CoverImage.FileName, userId);
        }

        var createReq = new CreatePostRequest(req.Title, req.Content, req.Summary, req.Tags, coverImageUrl, req.Status);
        var post = await _posts.CreateAsync(createReq, userId, userName);
        return CreatedAtAction(nameof(GetById), new { id = post.PostId }, post);
    }

    [Authorize]
    [HttpPut("{id}")]
    [Consumes("application/json")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdatePostRequest req)
    {
        var userId = User.FindFirstValue("uid")!;
        var post = await _posts.UpdateAsync(id, req, userId);
        if (post is null) return NotFound();
        return Ok(post);
    }

    [Authorize]
    [HttpPut("{id}")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UpdateWithImage(string id, [FromForm] UpdatePostFormRequest req)
    {
        var userId = User.FindFirstValue("uid")!;
        var coverImageUrl = req.CoverImageUrl;

        if (req.CoverImage is not null)
        {
            var validationError = await ValidateImageAsync(req.CoverImage);
            if (validationError is not null)
                return BadRequest(validationError);

            await using var imageStream = req.CoverImage.OpenReadStream();
            coverImageUrl = await _fileService.SaveFileAsync(imageStream, req.CoverImage.FileName, userId);
        }

        var updateReq = new UpdatePostRequest(req.Title, req.Content, req.Summary, req.Tags, coverImageUrl, req.Status);
        var post = await _posts.UpdateAsync(id, updateReq, userId);
        if (post is null) return NotFound();
        return Ok(post);
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var userId = User.FindFirstValue("uid")!;
        var success = await _posts.DeleteAsync(id, userId);
        if (!success) return NotFound();
        return NoContent();
    }

    private static async Task<string?> ValidateImageAsync(IFormFile file)
    {
        if (file.Length == 0) return "Image file is empty.";
        if (file.Length > MaxImageSizeBytes) return "Image file size must be 5MB or less.";

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedImageExtensions.Contains(extension))
            return "Invalid image extension. Allowed: .jpg, .jpeg, .png, .gif, .webp.";

        var contentType = file.ContentType.ToLowerInvariant();
        if (!AllowedImageContentTypes.Contains(contentType))
            return "Invalid image content type.";

        if (!FileSignatures.TryGetValue(extension, out var signatures))
            return "Unsupported image format.";

        var maxSignatureLength = signatures.Max(s => s.Length);
        var buffer = new byte[maxSignatureLength];

        await using var stream = file.OpenReadStream();
        var bytesRead = await stream.ReadAsync(buffer, 0, buffer.Length);

        var signatureMatched = signatures.Any(sig =>
            bytesRead >= sig.Length && buffer.AsSpan(0, sig.Length).SequenceEqual(sig));

        if (!signatureMatched) return "Invalid image file signature.";

        if (extension == ".webp")
        {
            if (bytesRead < 12) return "Invalid WEBP image file.";

            var webpHeader = Encoding.ASCII.GetString(buffer, 8, 4);
            if (!webpHeader.Equals("WEBP", StringComparison.Ordinal))
                return "Invalid WEBP image file.";
        }

        return null;
    }

    public class CreatePostFormRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string? Summary { get; set; }
        public List<string>? Tags { get; set; }
        public string? CoverImageUrl { get; set; }
        public IFormFile? CoverImage { get; set; }
        public BlogApp.Domain.Entities.PostStatus Status { get; set; }
    }

    public class UpdatePostFormRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string? Summary { get; set; }
        public List<string>? Tags { get; set; }
        public string? CoverImageUrl { get; set; }
        public IFormFile? CoverImage { get; set; }
        public BlogApp.Domain.Entities.PostStatus Status { get; set; }
    }
}
