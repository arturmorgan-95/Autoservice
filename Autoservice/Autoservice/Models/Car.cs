namespace Autoservice.Models;

public class Car
{
    public int Id { get; set; }

    public int ClientId { get; set; }

    public string Brand { get; set; } = string.Empty;

    public string Model { get; set; } = string.Empty;

    public int Year { get; set; }

    public string LicensePlate { get; set; } = string.Empty;

    public User? Client { get; set; }

    public ICollection<Application> Applications { get; set; } = new List<Application>();
}