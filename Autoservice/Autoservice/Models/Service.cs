namespace Autoservice.Models;

public class Service
{
    public int Id { get; set; }

    public string ServiceName { get; set; } = string.Empty;

    public decimal BasePrice { get; set; }

    public decimal DurationHours { get; set; }

    public ICollection<ApplicationService> ApplicationServices { get; set; } = new List<ApplicationService>();
}