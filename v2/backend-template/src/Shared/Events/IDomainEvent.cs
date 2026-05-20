namespace BackendTemplate.Shared.Events;

public interface IDomainEvent
{
    DateTime OccurredOnUtc { get; }
    string EventName { get; }
}
