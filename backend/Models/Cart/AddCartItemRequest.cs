using System.ComponentModel.DataAnnotations;

namespace ECommerce.Api.Models.CartModels;

public class AddCartItemRequest
{
    [Required]
    public string ProductId { get; set; } = string.Empty;

    [Range(1, int.MaxValue)]
    public int Quantity { get; set; } = 1;

    public string? Size { get; set; }

    public string? Color { get; set; }
}
