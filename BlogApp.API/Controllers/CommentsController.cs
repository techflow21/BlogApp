using BlogApp.Application.DTOs.Comments;
using BlogApp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BlogApp.API.Controllers;

[ApiController]
[Route("api/comments")]
public class CommentsController : ControllerBase
{
    private readonly ICommentService _comments;

    public CommentsController(ICommentService comments)
    {
        _comments = comments;
    }

    [HttpGet("post/{postId}")]
    public async Task<IActionResult> GetByPost(string postId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var result = await _comments.GetCommentsAsync(postId, page, pageSize);
        return Ok(result);
    }

    [HttpGet("{commentId}/replies")]
    public async Task<IActionResult> GetReplies(string commentId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var result = await _comments.GetRepliesAsync(commentId, page, pageSize);
        return Ok(result);
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> AddComment([FromBody] CreateCommentRequest req)
    {
        var authorId = User.FindFirstValue("uid")!;
        var authorName = User.FindFirstValue(ClaimTypes.Email) ?? authorId;
        var comment = await _comments.AddCommentAsync(req, authorId, authorName, null);
        return CreatedAtAction(nameof(GetReplies), new { commentId = comment.CommentId }, comment);
    }

    [Authorize]
    [HttpPut("{commentId}")]
    public async Task<IActionResult> UpdateComment(string commentId, [FromBody] UpdateCommentRequest req)
    {
        var userId = User.FindFirstValue("uid")!;
        var result = await _comments.UpdateCommentAsync(commentId, req, userId);
        if (result is null) return NotFound();
        return Ok(result);
    }

    [Authorize]
    [HttpDelete("{commentId}")]
    public async Task<IActionResult> DeleteComment(string commentId)
    {
        var userId = User.FindFirstValue("uid")!;
        var isAdmin = User.IsInRole("Admin");
        var success = await _comments.DeleteCommentAsync(commentId, userId, isAdmin);
        if (!success) return NotFound();
        return NoContent();
    }
}
