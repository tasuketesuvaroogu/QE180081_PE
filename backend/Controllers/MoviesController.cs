using ECommerce.Api.Models;
using ECommerce.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MoviesController : ControllerBase
{
    private readonly MovieService _movieService;
    private readonly ILogger<MoviesController> _logger;

    public MoviesController(MovieService movieService, ILogger<MoviesController> logger)
    {
        _movieService = movieService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<List<Movie>>> GetMovies(
        [FromQuery] string? search = null,
        [FromQuery] string? genre = null,
        [FromQuery] int? rating = null)
    {
        try
        {
            var movies = await _movieService.GetAllAsync(search, genre, rating);
            return Ok(movies);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching movies");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Movie>> GetMovie(string id)
    {
        try
        {
            var movie = await _movieService.GetByIdAsync(id);
            
            if (movie == null)
            {
                return NotFound(new { message = "Movie not found" });
            }

            return Ok(movie);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching movie {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost]
    public async Task<ActionResult<Movie>> CreateMovie([FromBody] Movie movie)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var createdMovie = await _movieService.CreateAsync(movie);
            return CreatedAtAction(nameof(GetMovie), new { id = createdMovie.Id }, createdMovie);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating movie");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateMovie(string id, [FromBody] Movie movie)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingMovie = await _movieService.GetByIdAsync(id);
            if (existingMovie == null)
            {
                return NotFound(new { message = "Movie not found" });
            }

            movie.Id = id;
            movie.CreatedAt = existingMovie.CreatedAt;
            
            var updated = await _movieService.UpdateAsync(id, movie);
            
            if (!updated)
            {
                return NotFound(new { message = "Movie not found" });
            }

            return Ok(movie);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating movie {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteMovie(string id)
    {
        try
        {
            var deleted = await _movieService.DeleteAsync(id);
            
            if (!deleted)
            {
                return NotFound(new { message = "Movie not found" });
            }

            return Ok(new { message = "Movie deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting movie {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }
}
