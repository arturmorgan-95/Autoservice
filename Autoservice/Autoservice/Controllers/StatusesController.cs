using Autoservice.Data;
using Autoservice.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Autoservice.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StatusesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public StatusesController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _context.Statuses.ToListAsync());
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var status = await _context.Statuses.FindAsync(id);

        if (status == null)
            return NotFound();

        return Ok(status);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Status status)
    {
        _context.Statuses.Add(status);

        await _context.SaveChangesAsync();

        return Ok(status);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Status status)
    {
        if (id != status.Id)
            return BadRequest();

        _context.Entry(status).State = EntityState.Modified;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var status = await _context.Statuses.FindAsync(id);

        if (status == null)
            return NotFound();

        _context.Statuses.Remove(status);

        await _context.SaveChangesAsync();

        return NoContent();
    }
}