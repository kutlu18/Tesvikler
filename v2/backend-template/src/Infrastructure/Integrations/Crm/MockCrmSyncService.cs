using BackendTemplate.Application.CrmSync;
using BackendTemplate.Domain.ClientMaster;

namespace BackendTemplate.Infrastructure.Integrations.Crm;

public sealed class MockCrmSyncService : ICrmSyncService
{
    public Task<IReadOnlyCollection<ClientProfile>> PullClientsAsync(CancellationToken cancellationToken = default)
    {
        IReadOnlyCollection<ClientProfile> clients =
        [
            new ClientProfile
            {
                LegalName = "Demo A.S.",
                TaxNumber = "1234567890",
                IsSme = true
            }
        ];

        return Task.FromResult(clients);
    }
}
