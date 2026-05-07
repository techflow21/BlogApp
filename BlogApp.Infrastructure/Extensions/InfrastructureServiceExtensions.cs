using BlogApp.Application.Interfaces;
using BlogApp.Application.Services;
using BlogApp.Domain.Interfaces;
using BlogApp.Infrastructure.Repositories;
using BlogApp.Infrastructure.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MongoDB.Driver;
using StackExchange.Redis;

namespace BlogApp.Infrastructure.Extensions;

public static class InfrastructureServiceExtensions
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
    {
        // MongoDB
        services.AddSingleton<IMongoClient>(_ =>
            new MongoClient(config["MongoDb:ConnectionString"] ?? "mongodb://mongo:27017"));
        services.AddSingleton(sp =>
        {
            var client = sp.GetRequiredService<IMongoClient>();
            return client.GetDatabase(config["MongoDb:DatabaseName"] ?? "BlogAppDb");
        });

        // Redis
        var redisConn = config.GetSection("Redis:ConnectionString").Value ?? "localhost:6379";
        services.AddSingleton<IConnectionMultiplexer>(_ => ConnectionMultiplexer.Connect(redisConn));

        // Options
        services.Configure<JwtOptions>(config.GetSection("Jwt"));
        services.Configure<SmtpOptions>(config.GetSection("Smtp"));
        services.Configure<FileStorageOptions>(config.GetSection("FileStorage"));

        // Infrastructure services
        services.AddSingleton<IJwtService, JwtService>();
        services.AddSingleton<IEmailService, EmailService>();
        services.AddSingleton<ICacheService, CacheService>();
        services.AddSingleton<IFileService, FileService>();

        // Repositories
        services.AddScoped<IIdentityRepository, IdentityRepository>();
        services.AddScoped<IPostRepository, PostRepository>();
        services.AddScoped<ICommentRepository, CommentRepository>();
        services.AddScoped<IReactionRepository, ReactionRepository>();

        // Application services
        services.AddScoped<IIdentityService, IdentityService>();
        services.AddScoped<IPostService, PostService>();
        services.AddScoped<ICommentService, CommentService>();
        services.AddScoped<IReactionService, ReactionService>();
        services.AddScoped<IAdminService, AdminService>();

        return services;
    }
}
