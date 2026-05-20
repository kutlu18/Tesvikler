using BackendTemplate.Application.CrmSync;
using BackendTemplate.Infrastructure;

var builder = Host.CreateApplicationBuilder(args);
builder.Services.AddInfrastructure();
builder.Services.AddHostedService<SyncWorkerRunner>();

var host = builder.Build();
host.Run();

internal sealed class SyncWorkerRunner(ICrmSyncService crmSyncService, ILogger<SyncWorkerRunner> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            var clients = await crmSyncService.PullClientsAsync(stoppingToken);
            logger.LogInformation("SyncWorker pulled {Count} client(s)", clients.Count);
            await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
        }
    }
}
