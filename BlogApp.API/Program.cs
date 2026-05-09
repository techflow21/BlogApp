using BlogApp.Infrastructure.Extensions;
using BlogApp.Infrastructure.Services;
using HealthChecks.UI.Client;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.HttpLogging;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.IdentityModel.Tokens;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using Prometheus;
using Serilog;
using System.Text;

namespace BlogApp.API;

public class Program
{
    public static async Task Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        var config = builder.Configuration;

        var otlpEndpoint = Environment.GetEnvironmentVariable("GC_OTLP_ENDPOINT");
        var gcApiKey = Environment.GetEnvironmentVariable("GC_API_KEY");

        Log.Logger = new LoggerConfiguration()
            .MinimumLevel.Information()
            .Enrich.FromLogContext()
            .WriteTo.Console(new Serilog.Formatting.Json.JsonFormatter())
            .CreateLogger();

        builder.Host.UseSerilog();

        // Infrastructure (MongoDB, Redis, Repositories, Services)
        builder.Services.AddInfrastructure(config);

        // JWT Auth
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
            options.AddPolicy("RequireAdmin", policy => policy.RequireRole("Admin"));
            options.AddPolicy("CanPostPolicy", policy => policy.RequireClaim("CanPost", "true"));
        });

        // OpenTelemetry
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

        // Health Checks
        var redisConn = config.GetSection("Redis:ConnectionString").Value ?? "localhost:6379";
        builder.Services.AddHealthChecks()
            .AddCheck("self", () => HealthCheckResult.Healthy())
            .AddRedis(redisConn, name: "redis", failureStatus: HealthStatus.Degraded)
            .AddMongoDb(
                mongodbConnectionString: config["MongoDb:ConnectionString"] ?? "mongodb://mongo:27017",
                name: "mongodb",
                failureStatus: HealthStatus.Unhealthy);

        builder.Services
            .AddHealthChecksUI(opt => opt.AddHealthCheckEndpoint("BlogApp API", "/health"))
            .AddSqliteStorage("Data Source=healthchecks.db");

        builder.Services.AddControllers();
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen(options =>
        {
            options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                In = Microsoft.OpenApi.Models.ParameterLocation.Header,
                Description = "Please enter JWT with Bearer into field",
                Name = "Authorization",
                Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey
            });
            options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
            {
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

        app.UseSwagger();
        app.UseSwaggerUI();
        app.UseSerilogRequestLogging();
        app.UseHttpLogging();
        app.UseStaticFiles();
        app.UseRouting();
        app.UseAuthentication();
        app.UseAuthorization();
        app.UseHttpMetrics();
        app.MapControllers();
        app.MapMetrics();

        app.MapHealthChecks("/health", new HealthCheckOptions
        {
            ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
        });

        app.MapHealthChecksUI(options => { options.UIPath = "/health-ui"; });

        Log.Information("BlogApp.API started successfully!");
        await app.RunAsync();
    }
}
