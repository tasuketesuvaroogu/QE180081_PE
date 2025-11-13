using System.Security.Claims;
using ECommerce.Api.Models;
using ECommerce.Api.Models.Auth;
using ECommerce.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserService _userService;
    private readonly JwtService _jwtService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(UserService userService, JwtService jwtService, ILogger<AuthController> logger)
    {
        _userService = userService;
        _jwtService = jwtService;
        _logger = logger;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        try
        {
            var existingUser = await _userService.GetByEmailAsync(request.Email.ToLowerInvariant());
            if (existingUser != null)
            {
                return Conflict(new { message = "Email is already registered" });
            }

            var user = await _userService.CreateUserAsync(request.Email.ToLowerInvariant(), request.Password);
            var (token, expiresAt) = _jwtService.GenerateToken(user);

            return CreatedAtAction(nameof(GetCurrentUser), new { }, new AuthResponse
            {
                Token = token,
                Email = user.Email,
                UserId = user.Id ?? string.Empty,
                Role = user.Role,
                ExpiresAt = expiresAt
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error registering user");
            return StatusCode(500, new { message = "Failed to register user" });
        }
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        try
        {
            var user = await _userService.GetByEmailAsync(request.Email.ToLowerInvariant());
            if (user == null || !_userService.VerifyPassword(user, request.Password))
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            var (token, expiresAt) = _jwtService.GenerateToken(user);

            return Ok(new AuthResponse
            {
                Token = token,
                Email = user.Email,
                UserId = user.Id ?? string.Empty,
                Role = user.Role,
                ExpiresAt = expiresAt
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error logging in user");
            return StatusCode(500, new { message = "Failed to login" });
        }
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<object>> GetCurrentUser()
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var user = await _userService.GetByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            return Ok(new
            {
                userId = user.Id,
                email = user.Email,
                role = user.Role,
                createdAt = user.CreatedAt
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching current user");
            return StatusCode(500, new { message = "Failed to get current user" });
        }
    }
}
