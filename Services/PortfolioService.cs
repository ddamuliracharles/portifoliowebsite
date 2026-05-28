using System.Text.Json;
using System.Text.Json.Serialization;
using Portfolio.Models;

namespace Portfolio.Services;

public sealed class PortfolioService(
    IHttpClientFactory httpClientFactory,
    IConfiguration configuration,
    IWebHostEnvironment environment,
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

            I learn in public on GitHub, contribute to team and organisation codebases, and ship private
            client work under NDA. If you need someone who can ship and communicate, let's talk.
            """,
        Email = "ddamulira41@gmail.com",
        Phone = "0786398295",
        Location = "Uganda",
        GitHubUsername = DefaultUsername,
        GitHubUrl = "https://github.com/ddamuliracharles",
        Stats =
        [
            new() { Value = "5+", Label = "Years coding" },
            new() { Value = "12+", Label = "Projects & contributions" },
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
                Title = "Team & Org Delivery",
                Description = "Contributions to shared repos, organisation projects, and private client systems."
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
        ]
    };

    public async Task<PortfolioProfile> GetProfileAsync(CancellationToken cancellationToken = default)
    {
        var username = configuration["GitHub:Username"] ?? DefaultUsername;
        var catalog = WorkCatalogLoader.Load(environment);
        var githubRepos = await TryFetchGitHubReposAsync(username, cancellationToken);
        var contributions = await TryFetchContributionsAsync(username, cancellationToken);

        var projects = MergeProjects(catalog, githubRepos, contributions);

        return BaseProfile with
        {
            GitHubUsername = username,
            GitHubUrl = $"https://github.com/{username}",
            Projects = projects,
            Stats =
            [
                BaseProfile.Stats[0],
                new StatItem { Value = $"{projects.Count}+", Label = "Projects & contributions" },
                BaseProfile.Stats[2]
            ]
        };
    }

    private static List<ProjectItem> MergeProjects(
        IReadOnlyList<ProjectItem> catalog,
        IReadOnlyList<ProjectItem>? githubRepos,
        IReadOnlyList<ProjectItem> contributions)
    {
        var merged = new List<ProjectItem>();
        var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        void Add(ProjectItem item)
        {
            var key = item.Url ?? $"{item.Kind}:{item.Name}";
            if (!seen.Add(key))
            {
                return;
            }

            merged.Add(item);
        }

        foreach (var item in catalog)
        {
            Add(item);
        }

        foreach (var item in contributions)
        {
            Add(item);
        }

        if (githubRepos is not null)
        {
            foreach (var repo in githubRepos)
            {
                var existing = merged.FindIndex(p =>
                    !string.IsNullOrEmpty(p.Url) &&
                    !string.IsNullOrEmpty(repo.Url) &&
                    string.Equals(NormalizeUrl(p.Url), NormalizeUrl(repo.Url), StringComparison.OrdinalIgnoreCase));

                if (existing >= 0)
                {
                    var current = merged[existing];
                    merged[existing] = current with
                    {
                        Stars = repo.Stars,
                        UpdatedAt = repo.UpdatedAt,
                        Language = current.Language ?? repo.Language
                    };
                }
                else
                {
                    Add(repo with { Kind = repo.Kind == "personal" ? "personal" : repo.Kind });
                }
            }
        }

        return merged
            .OrderBy(p => p.IsPrivate ? 1 : 0)
            .ThenByDescending(p => p.UpdatedAt ?? DateTime.MinValue)
            .ThenBy(p => p.Name)
            .ToList();
    }

    private static string NormalizeUrl(string url) =>
        url.TrimEnd('/').ToLowerInvariant();

    private async Task<IReadOnlyList<ProjectItem>?> TryFetchGitHubReposAsync(
        string username,
        CancellationToken cancellationToken)
    {
        try
        {
            var client = httpClientFactory.CreateClient("GitHub");
            var hasToken = client.DefaultRequestHeaders.Authorization is not null;
            var query = hasToken
                ? $"users/{username}/repos?affiliation=owner,collaborator,organization_member&sort=updated&per_page=100"
                : $"users/{username}/repos?sort=updated&per_page=100";

            var response = await client.GetAsync(query, cancellationToken);
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
                .Where(r => !string.IsNullOrEmpty(r.Name))
                .Select(r => new ProjectItem
                {
                    Name = FormatRepoName(r.Name),
                    Description = string.IsNullOrWhiteSpace(r.Description)
                        ? "Open-source project on GitHub."
                        : r.Description,
                    Url = r.HtmlUrl ?? $"https://github.com/{username}/{r.Name}",
                    Language = r.Language,
                    Kind = r.Private ? "private" : (r.Fork ? "contribution" : "personal"),
                    Organization = r.Owner?.Login is { } owner && !owner.Equals(username, StringComparison.OrdinalIgnoreCase)
                        ? owner
                        : null,
                    Role = r.Fork ? "Contributor" : "Owner",
                    IsPrivate = r.Private,
                    Tags = BuildTags(r.Language, r.Private),
                    Stars = r.StargazersCount,
                    UpdatedAt = r.UpdatedAt
                })
                .ToList();
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "GitHub repos API unavailable.");
            return null;
        }
    }

    private async Task<IReadOnlyList<ProjectItem>> TryFetchContributionsAsync(
        string username,
        CancellationToken cancellationToken)
    {
        var results = new List<ProjectItem>();

        try
        {
            var client = httpClientFactory.CreateClient("GitHub");
            var response = await client.GetAsync($"users/{username}/events/public?per_page=100", cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                return results;
            }

            await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
            var events = await JsonSerializer.DeserializeAsync<List<GitHubEventDto>>(
                stream,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true },
                cancellationToken);

            if (events is null)
            {
                return results;
            }

            var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            foreach (var evt in events.Where(e => e.Type is "PushEvent" or "PullRequestEvent"))
            {
                var repoName = evt.Repo?.Name;
                if (string.IsNullOrEmpty(repoName))
                {
                    continue;
                }

                if (repoName.StartsWith($"{username}/", StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }

                if (!seen.Add(repoName))
                {
                    continue;
                }

                var parts = repoName.Split('/');
                var org = parts.Length > 1 ? parts[0] : null;
                var repo = parts.Length > 1 ? parts[1] : repoName;

                results.Add(new ProjectItem
                {
                    Name = FormatRepoName(repo),
                    Description = $"Contributed via {evt.Type?.Replace("Event", "")} on GitHub.",
                    Url = $"https://github.com/{repoName}",
                    Language = "GitHub",
                    Kind = "contribution",
                    Organization = org,
                    Role = "Contributor",
                    Tags = ["Contribution", "Collaboration", org ?? "Open Source"],
                    MermaidDiagram = """
                        flowchart LR
                          Me[My Work] -->|push / PR| Repo[Upstream Repository]
                          Repo --> Team[Team Review]
                          Team --> Main[main branch]
                        """
                });
            }
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "GitHub events API unavailable.");
        }

        return results;
    }

    private static string FormatRepoName(string? name) =>
        string.IsNullOrEmpty(name) ? "Repository" : name.Replace('-', ' ').Replace('_', ' ');

    private static IReadOnlyList<string> BuildTags(string? language, bool isPrivate = false)
    {
        var tags = new List<string>();
        if (!string.IsNullOrWhiteSpace(language))
        {
            tags.Add(language);
        }

        tags.Add(isPrivate ? "Private" : "Open Source");
        return tags;
    }

    private sealed class GitHubRepoDto
    {
        public string? Name { get; init; }
        public string? Description { get; init; }

        [JsonPropertyName("html_url")]
        public string? HtmlUrl { get; init; }

        public string? Language { get; init; }
        public bool Private { get; init; }
        public bool Fork { get; init; }
        public GitHubOwnerDto? Owner { get; init; }

        [JsonPropertyName("stargazers_count")]
        public int StargazersCount { get; init; }

        [JsonPropertyName("updated_at")]
        public DateTime? UpdatedAt { get; init; }
    }

    private sealed class GitHubOwnerDto
    {
        public string? Login { get; init; }
    }

    private sealed class GitHubEventDto
    {
        public string? Type { get; init; }
        public GitHubEventRepoDto? Repo { get; init; }
    }

    private sealed class GitHubEventRepoDto
    {
        public string? Name { get; init; }
    }
}
