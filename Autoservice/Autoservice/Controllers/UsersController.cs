using Autoservice.Data;
using Autoservice.Helpers;
using Autoservice.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Autoservice.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public UsersController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var users = await _context.Users
            .Include(u => u.Role)
            .ToListAsync();

        return Ok(users);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (user == null)
            return NotFound();

        return Ok(user);
    }

    [HttpPost]
    public async Task<IActionResult> Create(User user)
    {
        user.PasswordHash = PasswordHelper.Hash(user.PasswordHash);
        _context.Users.Add(user);

        await _context.SaveChangesAsync();

        return Ok(user);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, User user)
    {
        var existing = await _context.Users.FindAsync(id);
        if (existing == null)
            return NotFound();

        existing.RoleId = user.RoleId;
        existing.FullName = user.FullName;
        existing.Email = user.Email;
        existing.PhoneNumber = user.PhoneNumber;
        existing.Login = user.Login;

        if (!string.IsNullOrWhiteSpace(user.PasswordHash))
            existing.PasswordHash = PasswordHelper.Hash(user.PasswordHash);

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
            return NotFound();

        _context.Users.Remove(user);

        await _context.SaveChangesAsync();

        return NoContent();
    }
}