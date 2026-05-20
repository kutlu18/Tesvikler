using BackendTemplate.Application.Eligibility;
using BackendTemplate.Domain.ClientMaster;
using BackendTemplate.Infrastructure;

var builder = Host.CreateApplicationBuilder(args);
builder.Services.AddInfrastructure();
builder.Services.AddHostedService<RecalculationRunner>();

var host = builder.Build();
host.Run();

internal sealed class RecalculationRunner(IEligibilityService eligibilityService, ILogger<RecalculationRunner> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            var result = await eligibilityService.EvaluateAsync(
                new ClientProfile { LegalName = "Demo", TaxNumber = "123", IsSme = true },
                stoppingToken);

            logger.LogInformation("Recalculation completed. MessageCount={Count}", result.Count);
            await Task.Delay(TimeSpan.FromSeconds(45), stoppingToken);
        }
    }
}
