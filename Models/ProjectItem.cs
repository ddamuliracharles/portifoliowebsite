namespace Portfolio.Models;

public sealed record ProjectItem
{
    public required string Name { get; init; }
    public string? Description { get; init; }
    public string? Url { get; init; }
    public string? Language { get; init; }
    public string Kind { get; init; } = "personal";
    public string? Organization { get; init; }
    public string? Role { get; init; }
    public bool IsPrivate { get; init; }
    public IReadOnlyList<string> Tags { get; init; } = [];
    public string? MermaidDiagram { get; init; }
    public int Stars { get; init; }
    public DateTime? UpdatedAt { get; init; }

    public string KindLabel => Kind switch
    {
        "organization" => "Organization",
        "contribution" => "Open Source Contribution",
        "private" => "Private",
        _ => "Personal"
    };
}
