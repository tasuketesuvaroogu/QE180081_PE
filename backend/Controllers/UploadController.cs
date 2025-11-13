using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UploadController : ControllerBase
{
    private readonly ILogger<UploadController> _logger;
    private readonly IConfiguration _configuration;

    public UploadController(ILogger<UploadController> logger, IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<object>> Upload([FromForm(Name = "file")] IFormFile? file)
    {
        // If model binding didn't bind the file, try to read from the form files collection
        if ((file == null || file.Length == 0) && Request?.Form?.Files != null && Request.Form.Files.Count > 0)
        {
            file = Request.Form.Files[0];
        }

        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "No file provided" });
        }

        var uploadUrl = _configuration.GetValue<string>("UploadSettings:ExternalUploadUrl");
            
        var uploadToken = _configuration.GetValue<string>("UploadSettings:ExternalUploadToken");

        try
        {
            using var httpClient = new HttpClient();
            using var content = new MultipartFormDataContent();
            
            var fileContent = new StreamContent(file.OpenReadStream());
            fileContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(file.ContentType);
            content.Add(fileContent, "file", file.FileName);

            // Set Authorization header properly. appsettings may include the whole "Bearer <token>" string
            if (!string.IsNullOrEmpty(uploadToken))
            {
                // If the token already starts with "Bearer ", set the header value directly.
                if (uploadToken.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                {
                    httpClient.DefaultRequestHeaders.Add("Authorization", uploadToken);
                }
                else
                {
                    // Otherwise assume it's the raw token and use Bearer scheme
                    httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", uploadToken);
                }
            }
            
            var response = await httpClient.PostAsync(uploadUrl, content);
            
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Upload failed with status: {Status}", response.StatusCode);
                return StatusCode((int)response.StatusCode, new { message = "Upload failed" });
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            var jsonResponse = System.Text.Json.JsonDocument.Parse(responseContent);
            
            // Parse the response from your upload service
            // Expected format: { "success": true, "path": "/assets/...", "fileName": "..." }
            string? imageUrl = null;
            
            if (jsonResponse.RootElement.TryGetProperty("path", out var pathProp))
            {
                var path = pathProp.GetString();
                if (!string.IsNullOrEmpty(path))
                {
                    // Build absolute URL from path
                    if (!string.IsNullOrEmpty(uploadUrl))
                    {
                        try
                        {
                            var baseUri = new Uri(uploadUrl);
                            var origin = baseUri.GetLeftPart(UriPartial.Authority);
                            
                            if (path.StartsWith('/'))
                            {
                                imageUrl = $"{origin}{path}";
                            }
                            else if (path.StartsWith("http", StringComparison.OrdinalIgnoreCase))
                            {
                                imageUrl = path;
                            }
                            else
                            {
                                imageUrl = $"{origin}/{path}";
                            }
                        }
                        catch
                        {
                            imageUrl = path;
                        }
                    }
                    else
                    {
                        imageUrl = path;
                    }
                }
            }

            if (string.IsNullOrEmpty(imageUrl))
            {
                return StatusCode(500, new { message = "Failed to get image URL from upload service" });
            }

            return Ok(new { url = imageUrl });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading file");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }
}
