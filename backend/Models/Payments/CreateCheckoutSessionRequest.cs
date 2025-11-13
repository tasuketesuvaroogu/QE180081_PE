using System.ComponentModel.DataAnnotations;

namespace ECommerce.Api.Models.Payments;

public class CreateCheckoutSessionRequest
{
    [Required]
    public string OrderId { get; set; } = string.Empty;

    /// <summary>
    /// Optional success URL override (otherwise config value used)
    /// </summary>
    public string? SuccessUrl { get; set; }

    /// <summary>
    /// Optional cancel URL override (otherwise config value used)
    /// </summary>
    public string? CancelUrl { get; set; }
}
