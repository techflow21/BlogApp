using BlogApp.Application.DTOs.Reactions;
using BlogApp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BlogApp.API.Controllers;

[ApiController]
[Route("api/reactions")]
public class ReactionsController : ControllerBase
{
    private readonly IReactionService _reactions;

    public ReactionsController(IReactionService reactions)
    {
        _reactions = reactions;
    }

    [Authorize]
    [HttpPost("posts/{postId}")]
    public async Task<IActionResult> TogglePostReaction(string postId, [FromBody] ToggleReactionRequest req)
    {
        var userId = User.FindFirstValue("uid")!;
        var result = await _reactions.TogglePostReactionAsync(postId, userId, req.Type);
        return Ok(result);
    }

    [Authorize]
    [HttpPost("comments/{commentId}")]
    public async Task<IActionResult> ToggleCommentReaction(string commentId, [FromBody] ToggleReactionRequest req)
    {
        var userId = User.FindFirstValue("uid")!;
        var result = await _reactions.ToggleCommentReactionAsync(commentId, userId, req.Type);
        return Ok(result);
    }

    [Authorize]
    [HttpGet("posts/{postId}")]
    public async Task<IActionResult> GetPostReaction(string postId)
    {
        var userId = User.FindFirstValue("uid")!;
        var result = await _reactions.GetPostReactionAsync(postId, userId);
        return Ok(result);
    }

    [Authorize]
    [HttpGet("comments/{commentId}")]
    public async Task<IActionResult> GetCommentReaction(string commentId)
    {
        var userId = User.FindFirstValue("uid")!;
        var result = await _reactions.GetCommentReactionAsync(commentId, userId);
        return Ok(result);
    }
}
