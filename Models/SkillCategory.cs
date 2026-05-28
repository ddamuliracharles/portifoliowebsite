namespace Portfolio.Models;

public sealed class SkillCategory
{
    public required string Title { get; init; }
    public IReadOnlyList<string> Items { get; init; } = [];
}
