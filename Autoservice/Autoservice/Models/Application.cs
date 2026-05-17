namespace Autoservice.Models;

public class Application
{
    public int Id { get; set; }

    public int ClientId { get; set; }

    public int CarId { get; set; }

    public int? AdminId { get; set; }

    public int StatusId { get; set; }

    public string ProblemDescription { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public User? Client { get; set; }

    public Car? Car { get; set; }

    public User? Admin { get; set; }

    public Status? Status { get; set; }

    public ICollection<ApplicationService> ApplicationServices { get; set; } = new List<ApplicationService>();

    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}