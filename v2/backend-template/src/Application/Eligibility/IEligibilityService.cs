using BackendTemplate.Domain.ClientMaster;

namespace BackendTemplate.Application.Eligibility;

public interface IEligibilityService
{
    Task<IReadOnlyCollection<string>> EvaluateAsync(ClientProfile client, CancellationToken cancellationToken = default);
}
