using BlogApp.API.Models;
using BlogApp.API.Repository;

namespace BlogApp.API.EndPointsExtension
{
    public static class PostEndpoints
    {
        public static void MapPostEndpoints(this IEndpointRouteBuilder routes)
        {
            var group = routes.MapGroup("/posts");

            group.MapGet("/", async (PostRepository repo) => await repo.GetPostsAsync());

            group.MapGet("/{id}", async (PostRepository repo, string id) =>
                await repo.GetPostAsync(id) is { } b ? Results.Ok(b) : Results.NotFound());

            group.MapPost("/", async (PostRepository repo, Post b) =>
            {
                await repo.CreatePostAsync(b);
                return Results.Created($"/posts/{b.PostId}", b);
            });


            group.MapPut("/{id}", async (PostRepository repo, string id, Post b) =>
            {
                b.PostId = id;
                await repo.UpdatePostAsync(b);
                return Results.NoContent();
            });


            group.MapDelete("/{id}", async (PostRepository repo, string id) =>
            {
                await repo.DeletePostAsync(id);
                return Results.NoContent();
            });
        }
    }

}
