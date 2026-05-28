using Microsoft.AspNetCore.Mvc.RazorPages;
using Portfolio.Models;
using Portfolio.Services;

namespace Portfolio.Pages;

public class IndexModel(IPortfolioService portfolioService) : PageModel
{
    public PortfolioProfile Profile { get; private set; } = null!;

    public async Task OnGetAsync(CancellationToken cancellationToken)
    {
        Profile = await portfolioService.GetProfileAsync(cancellationToken);
    }
}
