using System.Text.Json;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Portfolio.Models;
using Portfolio.Services;

namespace Portfolio.Pages;

public class IndexModel(
    IPortfolioService portfolioService,
    IConfiguration configuration) : PageModel
{
    public PortfolioProfile Profile { get; private set; } = null!;
    public string ContactRecipientEmail { get; private set; } = "ddamulira44@gmail.com";
    public string FormSubmitUrl { get; private set; } = "https://formsubmit.co/ajax/ddamulira44@gmail.com";
    public string ContactConfigJson { get; private set; } = "{}";

    public async Task OnGetAsync(CancellationToken cancellationToken)
    {
        Profile = await portfolioService.GetProfileAsync(cancellationToken);

        ContactRecipientEmail = configuration["Contact:RecipientEmail"]
            ?? configuration["Contact:Email"]
            ?? Profile.Email;

        FormSubmitUrl = configuration["Contact:FormSubmitUrl"]
            ?? $"https://formsubmit.co/ajax/{ContactRecipientEmail}";

        ContactConfigJson = JsonSerializer.Serialize(new
        {
            recipientEmail = ContactRecipientEmail,
            email = ContactRecipientEmail,
            formsubmitUrl = FormSubmitUrl
        });
    }
}
