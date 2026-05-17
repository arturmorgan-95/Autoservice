using Autoservice.Data;
using Autoservice.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Autoservice.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ApplicationServicesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ApplicationServicesController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var services = await _context.ApplicationsServices
            .Include(a => a.Application)
            .Include(a => a.Service)
            .Include(a => a.Master)
            .Include(a => a.Status)
            .ToListAsync();

        return Ok(services);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var service = await _context.ApplicationsServices
            .Include(a => a.Application)
            .Include(a => a.Service)
            .Include(a => a.Master)
            .Include(a => a.Status)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (service == null)
            return NotFound();

        return Ok(service);
    }

    [HttpPost]
    public async Task<IActionResult> Create(ApplicationService applicationService)
    {
        _context.ApplicationsServices.Add(applicationService);

        await _context.SaveChangesAsync();

        return Ok(applicationService);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, ApplicationService applicationService)
    {
        if (id != applicationService.Id)
            return BadRequest();

        _context.Entry(applicationService).State = EntityState.Modified;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> ChangeStatus(int id, int statusId)
    {
        var service = await _context.ApplicationsServices.FindAsync(id);

        if (service == null)
            return NotFound();

        service.StatusId = statusId;

        await _context.SaveChangesAsync();

        return Ok(service);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var service = await _context.ApplicationsServices.FindAsync(id);

        if (service == null)
            return NotFound();

        _context.ApplicationsServices.Remove(service);

        await _context.SaveChangesAsync();

        return NoContent();
    }
}