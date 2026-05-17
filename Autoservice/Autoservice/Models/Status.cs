namespace Autoservice.Models;

public class Status
{
    public int Id { get; set; }

    public string StatusName { get; set; } = string.Empty;

    public ICollection<Application> Applications { get; set; } = new List<Application>();

    public ICollection<ApplicationService> ApplicationServices { get; set; } = new List<ApplicationService>();
}