using Autoservice.Data;
using Autoservice.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Autoservice.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PaymentsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var payments = await _context.Payments
            .Include(p => p.Application)
            .ToListAsync();

        return Ok(payments);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var payment = await _context.Payments
            .Include(p => p.Application)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (payment == null)
            return NotFound();

        return Ok(payment);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Payment payment)
    {
        payment.PaymentDate = DateTime.UtcNow;

        _context.Payments.Add(payment);

        await _context.SaveChangesAsync();

        return Ok(payment);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Payment payment)
    {
        if (id != payment.Id)
            return BadRequest();

        _context.Entry(payment).State = EntityState.Modified;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var payment = await _context.Payments.FindAsync(id);

        if (payment == null)
            return NotFound();

        _context.Payments.Remove(payment);

        await _context.SaveChangesAsync();

        return NoContent();
    }
}