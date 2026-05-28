namespace Portfolio.Models;

public sealed class ProjectItem
{
    public required string Name { get; init; }
    public string? Description { get; init; }
    public required string Url { get; init; }
    public string? Language { get; init; }
    public IReadOnlyList<string> Tags { get; init; } = [];
    public int Stars { get; init; }
    public DateTime? UpdatedAt { get; init; }
}
