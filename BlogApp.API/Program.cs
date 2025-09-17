using BlogApp.API.EndPointsExtension;
using BlogApp.API.Models;
using BlogApp.API.Repository;
using BlogApp.API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder.Extensions;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using Serilog;
using StackExchange.Redis;
using System.Text;

namespace BlogApp.API
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Serilog
            /*Log.Logger = new LoggerConfiguration()
                .WriteTo.Console()
                .WriteTo.File("logs/app-.log", rollingInterval: RollingInterval.Day)
                .Enrich.FromLogContext()
                .MinimumLevel.Information()
                .CreateLogger();

            builder.Host.UseSerilog();*/
            builder.Host.UseSerilog((context, services, configuration) =>
            {
                configuration.ReadFrom.Configuration(context.Configuration)
                             .ReadFrom.Services(services)
                             .Enrich.FromLogContext();
            });

            // Redis setup
            builder.Services.AddSingleton<IConnectionMultiplexer>(sp =>
            {
                var config = builder.Configuration["Redis:ConnectionString"];
                return ConnectionMultiplexer.Connect(config!);
            });

            // Mongo setup
            var mongoConn = builder.Configuration["MongoDb:ConnectionString"];
            var dbName = builder.Configuration["MongoDb:DatabaseName"];
            builder.Services.AddSingleton<IMongoClient>(_ => new MongoClient(mongoConn));
            builder.Services.AddSingleton(sp =>
            {
                var client = sp.GetRequiredService<IMongoClient>();
                return client.GetDatabase(dbName);
            });

            // options binding
            builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));
            builder.Services.Configure<SmtpOptions>(builder.Configuration.GetSection("Smtp"));
            builder.Services.Configure<FileStorageOptions>(builder.Configuration.GetSection("FileStorage"));

            builder.Services.AddSingleton<IJwtService, JwtService>();
            builder.Services.AddSingleton<IEmailService, EmailService>();
            builder.Services.AddSingleton<IFileService, FileService>();

            // JWT Auth
            var jwt = builder.Configuration.GetSection("Jwt").Get<JwtOptions>()!;
            builder.Services
                .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(o =>
                {
                    o.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidIssuer = jwt.Issuer,
                        ValidAudience = jwt.Audience,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key)),
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ClockSkew = TimeSpan.FromSeconds(30)
                    };
                });

            // Authorization policies (role & claim)
            builder.Services.AddAuthorization(options =>
            {
                options.AddPolicy("CanPostPolicy", p => p.RequireClaim("CanPost", "true"));
                options.AddPolicy("AdminOnly", p => p.RequireRole("Admin"));
            });
                        

            builder.Services.AddSingleton<ICacheService, CacheService>();

            // Register repository
            builder.Services.AddSingleton<PostRepository>();

            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }
            // Mongo indices (optional)
            var db = app.Services.GetRequiredService<IMongoDatabase>();
            var users = db.GetCollection<User>("Users");
            await users.Indexes.CreateOneAsync(new CreateIndexModel<User>(
                Builders<User>.IndexKeys.Ascending(u => u.NormalizedEmail),
                new CreateIndexOptions { Unique = true }));
            // 
            app.MapPostEndpoints();

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();

            await app.RunAsync();
        }
    }
}
