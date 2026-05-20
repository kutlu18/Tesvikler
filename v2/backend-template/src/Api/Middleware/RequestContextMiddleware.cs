namespace BackendTemplate.Api.Middleware;

public class RequestContextMiddleware
{
    private readonly RequestDelegate _next;

    public RequestContextMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task Invoke(HttpContext context)
    {
        context.Items["RequestId"] = Guid.NewGuid().ToString("N");
        await _next(context);
    }
}
