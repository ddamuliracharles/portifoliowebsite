using System.Text.Json;
using System.Text.Json.Serialization;
using Portfolio.Models;

namespace Portfolio.Services;

public static class WorkCatalogLoader
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public static IReadOnlyList<ProjectItem> Load(IWebHostEnvironment env)
    {
        var path = Path.Combine(env.ContentRootPath, "Data", "work-catalog.json");
        if (!File.Exists(path))
        {
            return [];
        }

        var json = File.ReadAllText(path);
        var catalog = JsonSerializer.Deserialize<WorkCatalogDto>(json, JsonOptions);
        return catalog?.Projects?.Select(Map).ToList() ?? [];
    }

    private static ProjectItem Map(WorkProjectDto dto) => new()
    {
        Name = dto.Name ?? "Project",
        Description = dto.Description,
        Url = dto.Url,
        Language = dto.Language,
        Kind = dto.Kind ?? "personal",
        Organization = dto.Organization,
        Role = dto.Role,
        IsPrivate = dto.IsPrivate,
        Tags = dto.Tags ?? [],
        MermaidDiagram = dto.MermaidDiagram
    };

    private sealed class WorkCatalogDto
    {
        public List<WorkProjectDto>? Projects { get; init; }
    }

    private sealed class WorkProjectDto
    {
        public string? Name { get; init; }
        public string? Description { get; init; }
        public string? Url { get; init; }
        public string? Language { get; init; }
        public string? Kind { get; init; }
        public string? Organization { get; init; }
        public string? Role { get; init; }
        public bool IsPrivate { get; init; }
        public List<string>? Tags { get; init; }

        [JsonPropertyName("mermaidDiagram")]
        public string? MermaidDiagram { get; init; }
    }
}
