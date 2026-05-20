namespace BackendTemplate.Shared.Contracts;

public interface IRequestContext
{
    string CorrelationId { get; }
    DateTime RequestedAtUtc { get; }
}
