namespace BackendTemplate.Infrastructure.Messaging.Consumers;

public interface IIntegrationEventConsumer<in TEvent>
{
    Task ConsumeAsync(TEvent integrationEvent, CancellationToken cancellationToken = default);
}
