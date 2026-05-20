using BackendTemplate.Application.CrmSync;
using BackendTemplate.Application.Eligibility;
using BackendTemplate.Infrastructure.Integrations.Crm;
using BackendTemplate.Infrastructure.Services;
using Microsoft.Extensions.DependencyInjection;

namespace BackendTemplate.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddScoped<ICrmSyncService, MockCrmSyncService>();
        services.AddScoped<IEligibilityService, EligibilityService>();
        return services;
    }
}
