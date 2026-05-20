namespace BackendTemplate.Domain.ClientMaster;

public class ClientProfile
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public string LegalName { get; init; } = string.Empty;
    public string TaxNumber { get; init; } = string.Empty;
    public bool IsSme { get; init; }
}
