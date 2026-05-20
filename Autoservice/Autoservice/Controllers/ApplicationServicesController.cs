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
        applicationService.Id = id;
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

        var allServices = await _context.ApplicationsServices
            .Where(s => s.ApplicationId == service.ApplicationId)
            .ToListAsync();

        var application = await _context.Applications.FindAsync(service.ApplicationId);
        if (application != null)
        {
            var doneIds = new[] { 5, 6 };
            bool allDone = allServices.All(s => doneIds.Contains(s.StatusId));
            bool anyInWork = allServices.Any(s => s.StatusId >= 4);

            if (allDone)
            {
                var hasPaid = await _context.Payments
                    .AnyAsync(p => p.ApplicationId == service.ApplicationId && p.PaymentStatus == "Оплачено");

                application.StatusId = hasPaid ? 6 : 5;
            }
            else if (anyInWork)
                application.StatusId = 4;

            await _context.SaveChangesAsync();
        }

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