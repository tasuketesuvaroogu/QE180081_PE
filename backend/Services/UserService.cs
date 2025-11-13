using BCrypt.Net;
using ECommerce.Api.Models;
using MongoDB.Driver;

namespace ECommerce.Api.Services;

public class UserService
{
    private readonly IMongoCollection<User> _users;

    public UserService(DatabaseSettings settings)
    {
        var client = new MongoClient(settings.ConnectionString);
        var database = client.GetDatabase(settings.DatabaseName);
        _users = database.GetCollection<User>(settings.UsersCollectionName);
        CreateIndexesAsync().GetAwaiter().GetResult();
    }

    private async Task CreateIndexesAsync()
    {
        var emailIndex = Builders<User>.IndexKeys.Ascending(u => u.Email);
        var options = new CreateIndexOptions { Unique = true, Name = "idx_users_email" };
        await _users.Indexes.CreateOneAsync(new CreateIndexModel<User>(emailIndex, options));
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _users.Find(u => u.Email == email).FirstOrDefaultAsync();
    }

    public async Task<User?> GetByIdAsync(string userId)
    {
        return await _users.Find(u => u.Id == userId).FirstOrDefaultAsync();
    }

    public async Task<User> CreateUserAsync(string email, string password)
    {
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(password);
        var user = new User
        {
            Email = email,
            PasswordHash = passwordHash,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Role = "user"
        };

        await _users.InsertOneAsync(user);
        return user;
    }

    public bool VerifyPassword(User user, string password)
    {
        return BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);
    }

    public async Task UpdatePasswordAsync(string userId, string newPassword)
    {
        var hash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        var update = Builders<User>.Update
            .Set(u => u.PasswordHash, hash)
            .Set(u => u.UpdatedAt, DateTime.UtcNow);

        await _users.UpdateOneAsync(u => u.Id == userId, update);
    }
}
