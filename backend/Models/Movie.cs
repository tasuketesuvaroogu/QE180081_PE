using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace ECommerce.Api.Models;

public class Movie
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [Required]
    [BsonElement("title")]
    public string Title { get; set; } = string.Empty;

    [BsonElement("genre")]
    public string? Genre { get; set; }

    [BsonElement("rating")]
    [Range(1, 5)]
    public int? Rating { get; set; }

    [BsonElement("posterImage")]
    public string? PosterImage { get; set; }

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
