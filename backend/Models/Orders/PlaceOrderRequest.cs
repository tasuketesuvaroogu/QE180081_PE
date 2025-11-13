namespace ECommerce.Api.Models.Orders;

public class PlaceOrderRequest
{
    public string? ShippingAddress { get; set; }
    public string? Notes { get; set; }
}
