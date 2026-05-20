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
        var conflict = await FindConflict(user.Login, user.Email, user.PhoneNumber, excludeId: null);
        if (conflict != null)
            return Conflict(new { message = conflict });

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

        var conflict = await FindConflict(user.Login, user.Email, user.PhoneNumber, excludeId: id);
        if (conflict != null)
            return Conflict(new { message = conflict });

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

    private async Task<string?> FindConflict(string login, string email, string phone, int? excludeId)
    {
        var query = _context.Users.AsQueryable();
        if (excludeId.HasValue)
            query = query.Where(u => u.Id != excludeId.Value);

        if (await query.AnyAsync(u => u.Login == login))
            return "Пользователь с таким логином уже существует";

        if (!string.IsNullOrWhiteSpace(email) && await query.AnyAsync(u => u.Email == email))
            return "Пользователь с таким email уже существует";

        if (!string.IsNullOrWhiteSpace(phone) && await query.AnyAsync(u => u.PhoneNumber == phone))
            return "Пользователь с таким номером телефона уже существует";

        return null;
    }
}