using BackendTemplate.Domain.ClientMaster;

namespace BackendTemplate.Application.CrmSync;

public interface ICrmSyncService
{
    Task<IReadOnlyCollection<ClientProfile>> PullClientsAsync(CancellationToken cancellationToken = default);
}
