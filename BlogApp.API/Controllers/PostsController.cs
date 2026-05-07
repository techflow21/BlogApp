using BlogApp.Application.DTOs.Posts;
using BlogApp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BlogApp.API.Controllers;

[ApiController]
[Route("api/posts")]
public class PostsController : ControllerBase
{
    private readonly IPostService _posts;

    public PostsController(IPostService posts)
    {
        _posts = posts;
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
    public async Task<IActionResult> Create([FromBody] CreatePostRequest req)
    {
        var userId = User.FindFirstValue("uid")!;
        var userName = User.FindFirstValue(ClaimTypes.Email) ?? userId;
        var post = await _posts.CreateAsync(req, userId, userName);
        return CreatedAtAction(nameof(GetById), new { id = post.PostId }, post);
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdatePostRequest req)
    {
        var userId = User.FindFirstValue("uid")!;
        var post = await _posts.UpdateAsync(id, req, userId);
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
}
