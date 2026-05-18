using Autoservice.Data;
using Autoservice.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Autoservice.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ServicesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ServicesController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _context.Services.ToListAsync());
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var service = await _context.Services.FindAsync(id);

        if (service == null)
            return NotFound();

        return Ok(service);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Service service)
    {
        _context.Services.Add(service);

        await _context.SaveChangesAsync();

        return Ok(service);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Service service)
    {
        service.Id = id;
        _context.Entry(service).State = EntityState.Modified;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var service = await _context.Services.FindAsync(id);

        if (service == null)
            return NotFound();

        _context.Services.Remove(service);

        await _context.SaveChangesAsync();

        return NoContent();
    }
}