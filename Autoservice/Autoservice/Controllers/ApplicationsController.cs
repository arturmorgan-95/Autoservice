using Autoservice.Data;
using Autoservice.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Autoservice.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ApplicationsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ApplicationsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var applications = await _context.Applications
            .Include(a => a.Client)
            .Include(a => a.Car)
            .Include(a => a.Admin)
            .Include(a => a.Status)
            .ToListAsync();

        return Ok(applications);
    }

    [HttpGet("{Id}")]
    public async Task<IActionResult> GetById(int Id)
    {
        var application = await _context.Applications
            .Include(a => a.Client)
            .Include(a => a.Car)
            .Include(a => a.Admin)
            .Include(a => a.Status)
            .FirstOrDefaultAsync(a => a.Id == Id);

        if (application == null)
        {
            return NotFound();
        }

        return Ok(application);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Application application)
    {
        application.CreatedAt = DateTime.UtcNow;

        _context.Applications.Add(application);

        await _context.SaveChangesAsync();

        return Ok(application);
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> ChangeStatus(int id, int statusId)
    {
        var application = await _context.Applications.FindAsync(id);

        if (application == null)
            return NotFound();

        // Завершена (id=6) требует оплаченного платежа
        if (statusId == 6)
        {
            var hasPaid = await _context.Payments
                .AnyAsync(p => p.ApplicationId == id && p.PaymentStatus == "Оплачено");

            if (!hasPaid)
                return BadRequest(new { message = "Нельзя завершить заявку без оплаты. Сначала добавьте платёж со статусом «Оплачено»." });
        }

        application.StatusId = statusId;

        await _context.SaveChangesAsync();

        return Ok(application);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var application = await _context.Applications.FindAsync(id);

        if (application == null)
            return NotFound();

        _context.Applications.Remove(application);

        await _context.SaveChangesAsync();

        return NoContent();
    }
}