using BackendTemplate.Application.Eligibility;
using BackendTemplate.Domain.ClientMaster;

namespace BackendTemplate.Infrastructure.Services;

public sealed class EligibilityService : IEligibilityService
{
    public Task<IReadOnlyCollection<string>> EvaluateAsync(ClientProfile client, CancellationToken cancellationToken = default)
    {
        var list = new List<string>();

        if (client.IsSme)
        {
            list.Add("KOBI bazli programlar degerlendirilebilir.");
        }
        else
        {
            list.Add("KOBI disi firma icin alternatif program seti gerekli.");
        }

        return Task.FromResult<IReadOnlyCollection<string>>(list);
    }
}
