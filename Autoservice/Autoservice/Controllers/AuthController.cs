using Autoservice.Data;
using Autoservice.Helpers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Autoservice.Controllers
{
    public class LoginRequest
    {
        public string Login { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
    }

    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AuthController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Login) || string.IsNullOrWhiteSpace(request.PasswordHash))
            {
                return BadRequest(new { message = "Логин и пароль обязательны" });
            }

            var hashedPassword = PasswordHelper.Hash(request.PasswordHash);

            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Login == request.Login && u.PasswordHash == hashedPassword);

            if (user == null)
            {
                return Unauthorized(new { message = "Неверный логин или пароль" });
            }

            return Ok(user);
        }
    }
}
