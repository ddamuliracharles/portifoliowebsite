using System.Text.Json;
using System.Text.Json.Serialization;
using Portfolio.Models;

namespace Portfolio.Services;

public sealed class PortfolioService(
    IHttpClientFactory httpClientFactory,
    IConfiguration configuration,
    ILogger<PortfolioService> logger) : IPortfolioService
{
    private const string DefaultUsername = "ddamuliracharles";

    private static readonly PortfolioProfile BaseProfile = new()
    {
        FullName = "Ddamulira Charles Lugemwa",
        ShortName = "Charles",
        Title = "Software Developer",
        Tagline = "I build reliable software—from GIS and traffic systems to AI agents and full-stack web apps.",
        Bio = """
            Hello, I'm Ddamulira Charles Lugemwa, a software developer who turns ideas into working
            products. I work across C# and ASP.NET Core, modern JavaScript/TypeScript front ends,
            Python AI tooling, and geospatial systems that solve real infrastructure problems.
            """,
        AboutExtended = """
            I'm a developer who cares about clean code and clear outcomes. My work spans backend APIs,
            interactive maps, LangChain agents, and client-facing websites—always with an eye on maintainability
            and what end users actually need.

            I learn in public on GitHub, collaborate on team projects, and keep pushing into areas like GIS,
            automation, and smarter backends. If you need someone who can ship and communicate, let's talk.
            """,
        Email = "ddamulira41@gmail.com",
        Phone = "0786398295",
        Location = "Uganda",
        GitHubUsername = DefaultUsername,
        GitHubUrl = "https://github.com/ddamuliracharles",
        Stats =
        [
            new() { Value = "5+", Label = "Years coding" },
            new() { Value = "8+", Label = "GitHub projects" },
            new() { Value = "100%", Label = "Commitment" }
        ],
        Highlights =
        [
            new()
            {
                Title = "Full-Stack Development",
                Description = "End-to-end apps with ASP.NET Core, C#, and modern JavaScript front ends."
            },
            new()
            {
                Title = "GIS & Traffic Systems",
                Description = "Geospatial tools that map roads, signals, and infrastructure for smarter monitoring."
            },
            new()
            {
                Title = "AI & Automation",
                Description = "LangChain and LangGraph agents with Streamlit UIs for practical AI workflows."
            },
            new()
            {
                Title = "APIs & Backends",
                Description = "RESTful services, cleaner backend patterns, and integrations that scale."
            }
        ],
        SkillCategories =
        [
            new()
            {
                Title = "Languages & Core",
                Items = ["C#", ".NET", "JavaScript", "TypeScript", "Python", "SQL"]
            },
            new()
            {
                Title = "Web & Backend",
                Items = ["ASP.NET Core", "Razor Pages", "Node.js", "REST APIs", "HTML5", "CSS"]
            },
            new()
            {
                Title = "AI & Data",
                Items = ["LangChain", "LangGraph", "Streamlit", "Ollama", "GIS / Mapping"]
            },
            new()
            {
                Title = "Tools",
                Items = ["Git", "GitHub", "Docker", "Visual Studio", "VS Code"]
            }
        ],
        Projects =
        [
            new()
            {
                Name = "Traffic Monitoring GIS",
                Description = "GIS platform mapping roads, traffic lights, and weigh bridges for improved, trackable road usage.",
                Url = "https://github.com/ddamuliracharles/TRAFFIC-MONITERING-SYSTEM-DEMOSTRATION",
                Language = "TypeScript",
                Tags = ["TypeScript", "GIS", "Traffic Systems"]
            },
            new()
            {
                Name = "AI Agent with LangChain",
                Description = "AI agent experiments using LangChain for intelligent automation workflows.",
                Url = "https://github.com/ddamuliracharles/AI-agent-with-langchain",
                Language = "Python",
                Tags = ["Python", "LangChain", "AI Agents"]
            },
            new()
            {
                Name = "LangGraph & Streamlit App",
                Description = "LangGraph orchestration with a Streamlit UI for interactive agent demos.",
                Url = "https://github.com/ddamuliracharles/Langgraph-and-streamlit-application",
                Language = "Python",
                Tags = ["Python", "LangGraph", "Streamlit"]
            },
            new()
            {
                Name = "HOT Backend",
                Description = "Exploring cleaner, more productive backend patterns and API design.",
                Url = "https://github.com/ddamuliracharles/HOT_BACKEND",
                Language = "JavaScript",
                Tags = ["JavaScript", "Node.js", "APIs"]
            },
            new()
            {
                Name = "Homecare Website",
                Description = "Modern website for a homecare services business.",
                Url = "https://github.com/ddamuliracharles/homecare-website",
                Language = "Web",
                Tags = ["HTML", "CSS", "Business Site"]
            },
            new()
            {
                Name = "Git Journey",
                Description = "Hands-on practice repo for mastering Git and GitHub workflows.",
                Url = "https://github.com/ddamuliracharles/gitjourney",
                Language = "Git",
                Tags = ["Git", "GitHub", "Learning"]
            }
        ]
    };

    public async Task<PortfolioProfile> GetProfileAsync(CancellationToken cancellationToken = default)
    {
        var username = configuration["GitHub:Username"] ?? DefaultUsername;
        var projects = await TryFetchProjectsAsync(username, cancellationToken);
        var projectCount = projects?.Count ?? BaseProfile.Projects.Count;

        return BaseProfile with
        {
            GitHubUsername = username,
            GitHubUrl = $"https://github.com/{username}",
            Projects = projects ?? BaseProfile.Projects,
            Stats =
            [
                BaseProfile.Stats[0],
                new StatItem { Value = $"{projectCount}+", Label = "GitHub projects" },
                BaseProfile.Stats[2]
            ]
        };
    }

    private async Task<IReadOnlyList<ProjectItem>?> TryFetchProjectsAsync(
        string username,
        CancellationToken cancellationToken)
    {
        try
        {
            var client = httpClientFactory.CreateClient("GitHub");
            var response = await client.GetAsync(
                $"users/{username}/repos?sort=updated&per_page=12",
                cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                return null;
            }

            await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
            var repos = await JsonSerializer.DeserializeAsync<List<GitHubRepoDto>>(
                stream,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true },
                cancellationToken);

            if (repos is null or { Count: 0 })
            {
                return null;
            }

            return repos
                .Where(r => !r.Fork)
                .OrderByDescending(r => r.UpdatedAt)
                .Select(r => new ProjectItem
                {
                    Name = FormatRepoName(r.Name),
                    Description = string.IsNullOrWhiteSpace(r.Description)
                        ? "Open-source project on GitHub."
                        : r.Description,
                    Url = r.HtmlUrl ?? $"https://github.com/{username}",
                    Language = r.Language,
                    Tags = BuildTags(r.Language),
                    Stars = r.StargazersCount,
                    UpdatedAt = r.UpdatedAt
                })
                .ToList();
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "GitHub API unavailable; using curated project list.");
            return null;
        }
    }

    private static string FormatRepoName(string? name) =>
        string.IsNullOrEmpty(name)
            ? "Repository"
            : name.Replace('-', ' ').Replace('_', ' ');

    private static IReadOnlyList<string> BuildTags(string? language) =>
        string.IsNullOrWhiteSpace(language) ? ["GitHub"] : [language, "Open Source"];

    private sealed class GitHubRepoDto
    {
        public string? Name { get; init; }
        public string? Description { get; init; }

        [JsonPropertyName("html_url")]
        public string? HtmlUrl { get; init; }

        public string? Language { get; init; }

        [JsonPropertyName("stargazers_count")]
        public int StargazersCount { get; init; }

        [JsonPropertyName("updated_at")]
        public DateTime? UpdatedAt { get; init; }

        public bool Fork { get; init; }
    }
}
