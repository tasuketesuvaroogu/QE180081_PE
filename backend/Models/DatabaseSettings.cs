namespace ECommerce.Api.Models;

public class DatabaseSettings
{
    public string ConnectionString { get; set; } = string.Empty;
    public string DatabaseName { get; set; } = string.Empty;
    public string MoviesCollectionName { get; set; } = string.Empty;
    public string UsersCollectionName { get; set; } = string.Empty;
}
