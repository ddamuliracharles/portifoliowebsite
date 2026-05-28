using Portfolio.Models;

namespace Portfolio.Services;

public interface IPortfolioService
{
    Task<PortfolioProfile> GetProfileAsync(CancellationToken cancellationToken = default);
}
