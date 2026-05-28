namespace Portfolio.Models;

public sealed record PortfolioProfile
{
    public required string FullName { get; init; }
    public required string ShortName { get; init; }
    public required string Title { get; init; }
    public required string Tagline { get; init; }
    public required string Bio { get; init; }
    public required string AboutExtended { get; init; }
    public required string Email { get; init; }
    public required string Phone { get; init; }
    public required string Location { get; init; }
    public required string GitHubUrl { get; init; }
    public required string GitHubUsername { get; init; }
    public IReadOnlyList<StatItem> Stats { get; init; } = [];
    public IReadOnlyList<HighlightItem> Highlights { get; init; } = [];
    public IReadOnlyList<SkillCategory> SkillCategories { get; init; } = [];
    public IReadOnlyList<ProjectItem> Projects { get; init; } = [];
}
