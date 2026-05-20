namespace BackendTemplate.Application.Common;

public interface IDateTimeProvider
{
    DateTime UtcNow { get; }
}
