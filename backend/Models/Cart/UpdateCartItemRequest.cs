using System.ComponentModel.DataAnnotations;

namespace ECommerce.Api.Models.CartModels;

public class UpdateCartItemRequest
{
    [Required]
    public string ItemId { get; set; } = string.Empty;

    [Range(1, int.MaxValue)]
    public int Quantity { get; set; } = 1;
}
