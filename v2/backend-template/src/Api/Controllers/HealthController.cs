using BackendTemplate.Api.Contracts;
using Microsoft.AspNetCore.Mvc;

namespace BackendTemplate.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public ActionResult<HealthResponse> Get()
    {
        return Ok(new HealthResponse(true, "backend-template", DateTime.UtcNow));
    }
}
