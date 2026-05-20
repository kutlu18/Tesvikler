namespace BackendTemplate.Api.Contracts;

public record HealthResponse(bool Ok, string Service, DateTime TimestampUtc);
