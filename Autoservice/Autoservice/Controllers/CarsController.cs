using Autoservice.Data;
using Autoservice.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Autoservice.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CarsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CarsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var cars = await _context.Cars
            .Include(c => c.Client)
            .ToListAsync();

        return Ok(cars);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var car = await _context.Cars
            .Include(c => c.Client)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (car == null)
            return NotFound();

        return Ok(car);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Car car)
    {
        _context.Cars.Add(car);

        await _context.SaveChangesAsync();

        return Ok(car);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Car car)
    {
        if (id != car.Id)
            return BadRequest();

        _context.Entry(car).State = EntityState.Modified;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var car = await _context.Cars.FindAsync(id);

        if (car == null)
            return NotFound();

        _context.Cars.Remove(car);

        await _context.SaveChangesAsync();

        return NoContent();
    }
}