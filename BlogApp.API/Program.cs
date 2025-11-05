using BlogApp.API.EndPointsExtension;
using BlogApp.API.Repository;
using BlogApp.API.Services;
using HealthChecks.UI.Client;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.HttpLogging;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using OpenTelemetry.Logs;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using Prometheus;
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
            var config = builder.Configuration;

            // =====================
            // Load environment variables (Grafana OTLP)
            // =====================
            var otlpEndpoint = Environment.GetEnvironmentVariable("GC_OTLP_ENDPOINT");
            var gcApiKey = Environment.GetEnvironmentVariable("GC_API_KEY");

            // =====================
            // Serilog (Console + JSON)
            // =====================
            Log.Logger = new LoggerConfiguration()
                .MinimumLevel.Information()
                .Enrich.FromLogContext()
                .WriteTo.Console(new Serilog.Formatting.Json.JsonFormatter())
                .CreateLogger();

            builder.Host.UseSerilog();

            // =====================
            // Redis & Mongo setup
            // =====================
            var redisConn = config.GetSection("Redis:ConnectionString").Value ?? "localhost:6379";
            builder.Services.AddSingleton<IConnectionMultiplexer>(_ =>
                ConnectionMultiplexer.Connect(redisConn));

            builder.Services.AddSingleton<IMongoClient>(_ =>
                new MongoClient(config["MongoDb:ConnectionString"] ?? "mongodb://mongo:27017"));

            builder.Services.AddSingleton(sp =>
            {
                var client = sp.GetRequiredService<IMongoClient>();
                return client.GetDatabase(config["MongoDb:DatabaseName"] ?? "BlogAppDb");
            });

            // =====================
            // Services registration
            // =====================
            builder.Services.AddSingleton<IEmailService, EmailService>();
            builder.Services.AddSingleton<IFileService, FileService>();
            builder.Services.AddSingleton<ICacheService, CacheService>();
            builder.Services.AddSingleton<PostRepository>();

            // =====================
            // JWT Setup
            // =====================
            var jwtSection = config.GetSection("Jwt");
            var jwtKey = jwtSection["Key"];

            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(o =>
                {
                    o.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = jwtSection["Issuer"],
                        ValidAudience = jwtSection["Audience"],
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey!))
                    };
                });

            builder.Services.AddAuthorization(options =>
            {
                options.AddPolicy("RequireAdmin", policy =>
                    policy.RequireClaim("role", "Admin"));
            });

            // =====================
            // OpenTelemetry
            // =====================
            builder.Services.AddOpenTelemetry()
                .ConfigureResource(r => r.AddService("BlogApp.API"))
                .WithTracing(t =>
                {
                    t.AddAspNetCoreInstrumentation()
                     .AddHttpClientInstrumentation()
                     .AddMongoDBInstrumentation()
                     .AddRedisInstrumentation();

                    if (!string.IsNullOrEmpty(otlpEndpoint))
                    {
                        t.AddOtlpExporter(opt =>
                        {
                            opt.Endpoint = new Uri(otlpEndpoint);
                            opt.Protocol = OpenTelemetry.Exporter.OtlpExportProtocol.HttpProtobuf;
                            if (!string.IsNullOrEmpty(gcApiKey))
                                opt.Headers = $"Authorization=Bearer {gcApiKey}";
                        });
                    }
                })
                .WithMetrics(m =>
                {
                    m.AddAspNetCoreInstrumentation()
                     .AddRuntimeInstrumentation()
                     .AddHttpClientInstrumentation();

                    if (!string.IsNullOrEmpty(otlpEndpoint))
                    {
                        m.AddOtlpExporter(opt =>
                        {
                            opt.Endpoint = new Uri(otlpEndpoint);
                            opt.Protocol = OpenTelemetry.Exporter.OtlpExportProtocol.HttpProtobuf;
                            if (!string.IsNullOrEmpty(gcApiKey))
                                opt.Headers = $"Authorization=Bearer {gcApiKey}";
                        });
                    }
                });

            // =====================
            // Health Checks + UI
            // =====================
            builder.Services.AddHealthChecks()
                .AddCheck("self", () => HealthCheckResult.Healthy())
                .AddRedis(redisConn, name: "redis", failureStatus: HealthStatus.Degraded)
                .AddMongoDb(
                    mongodbConnectionString: config["MongoDb:ConnectionString"] ?? "mongodb://mongo:27017",
                    name: "mongodb",
                    failureStatus: HealthStatus.Unhealthy);

            // Add HealthChecks UI with persistent SQLite storage
            builder.Services
                .AddHealthChecksUI(opt =>
                {
                    opt.AddHealthCheckEndpoint("BlogApp API", "/health");
                })
                .AddSqliteStorage("Data Source=healthchecks.db");

            // =====================
            // Swagger + Controllers
            // =====================
            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(options =>
            {
                // Add JWT Auth to Swagger
                options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                {
                    In = Microsoft.OpenApi.Models.ParameterLocation.Header,
                    Description = "Please enter JWT with Bearer into field",
                    Name = "Authorization",
                    Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey
                });
                options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement {
                {
                    new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                    {
                        Reference = new Microsoft.OpenApi.Models.OpenApiReference
                        {
                            Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                    },
                    Array.Empty<string>()
                }
            });
            });

            builder.Services.AddHttpLogging(o => o.LoggingFields = HttpLoggingFields.All);

            var app = builder.Build();

            // =====================
            // Middleware
            // =====================
            app.UseSwagger();
            app.UseSwaggerUI();

            app.UseSerilogRequestLogging();
            app.UseHttpLogging();

            app.UseRouting();
            app.UseAuthentication();
            app.UseAuthorization();

            // Prometheus metrics
            app.UseHttpMetrics();
            app.MapControllers();
            app.MapMetrics();

            // Map health check endpoints
            app.MapHealthChecks("/health", new HealthCheckOptions
            {
                ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
            });

            // Map the Health Checks UI dashboard
            app.MapHealthChecksUI(options =>
            {
                options.UIPath = "/health-ui";
            });

            app.MapPostEndpoints();

            Log.Information("BlogApp.API started successfully!");
            await app.RunAsync();
        }
    }
}
