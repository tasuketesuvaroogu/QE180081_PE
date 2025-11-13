using ECommerce.Api.Models;
using MongoDB.Driver;

namespace ECommerce.Api.Services;

public class MovieService
{
    private readonly IMongoCollection<Movie> _movies;

    public MovieService(DatabaseSettings settings)
    {
        var client = new MongoClient(settings.ConnectionString);
        var database = client.GetDatabase(settings.DatabaseName);
        _movies = database.GetCollection<Movie>(settings.MoviesCollectionName);
    }

    public async Task<List<Movie>> GetAllAsync(
        string? search = null,
        string? genre = null,
        int? rating = null)
    {
        var filters = BuildFilters(search, genre, rating);

        return await _movies.Find(filters)
            .SortByDescending(m => m.CreatedAt)
            .ToListAsync();
    }

    public async Task<long> GetCountAsync(
        string? search = null,
        string? genre = null,
        int? rating = null)
    {
        var filters = BuildFilters(search, genre, rating);

        return await _movies.CountDocumentsAsync(filters);
    }

    private FilterDefinition<Movie> BuildFilters(string? search, string? genre, int? rating)
    {
        var filterBuilder = Builders<Movie>.Filter;
        var filters = new List<FilterDefinition<Movie>>();

        if (!string.IsNullOrEmpty(search))
        {
            var regex = new MongoDB.Bson.BsonRegularExpression(search, "i");
            filters.Add(filterBuilder.Regex(m => m.Title, regex));
        }

        if (!string.IsNullOrWhiteSpace(genre))
        {
            var regex = new MongoDB.Bson.BsonRegularExpression(genre, "i");
            filters.Add(filterBuilder.Regex(m => m.Genre, regex));
        }

        if (rating.HasValue)
        {
            filters.Add(filterBuilder.Eq(m => m.Rating, rating.Value));
        }

        return filters.Count switch
        {
            0 => filterBuilder.Empty,
            1 => filters[0],
            _ => filterBuilder.And(filters)
        };
    }

    public async Task<Movie?> GetByIdAsync(string id)
    {
        return await _movies.Find(m => m.Id == id).FirstOrDefaultAsync();
    }

    public async Task<Movie> CreateAsync(Movie movie)
    {
        movie.CreatedAt = DateTime.UtcNow;
        movie.UpdatedAt = DateTime.UtcNow;
        await _movies.InsertOneAsync(movie);
        return movie;
    }

    public async Task<bool> UpdateAsync(string id, Movie movie)
    {
        movie.UpdatedAt = DateTime.UtcNow;
        var result = await _movies.ReplaceOneAsync(m => m.Id == id, movie);
        return result.ModifiedCount > 0;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _movies.DeleteOneAsync(m => m.Id == id);
        return result.DeletedCount > 0;
    }
}