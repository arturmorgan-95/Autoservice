namespace Autoservice.Models;

public class ApplicationService
{
    public int Id { get; set; }

    public int ApplicationId { get; set; }

    public int ServiceId { get; set; }

    public int MasterId { get; set; }

    public int StatusId { get; set; }

    public decimal Price { get; set; }

    public Application? Application { get; set; }

    public Service? Service { get; set; }

    public User? Master { get; set; }

    public Status? Status { get; set; }
}