using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ECommerce.Api.Models;
using Microsoft.IdentityModel.Tokens;

namespace ECommerce.Api.Services;

public class JwtService
{
    private readonly JwtSettings _jwtSettings;

    public JwtService(JwtSettings jwtSettings)
    {
        _jwtSettings = jwtSettings;
    }

    public (string token, DateTime expiresAt) GenerateToken(User user)
    {
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var expires = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes);

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id ?? string.Empty),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.NameIdentifier, user.Id ?? string.Empty),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role)
        };

        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: expires,
            signingCredentials: credentials);

        var tokenHandler = new JwtSecurityTokenHandler();
        var tokenString = tokenHandler.WriteToken(token);
        return (tokenString, expires);
    }
}
