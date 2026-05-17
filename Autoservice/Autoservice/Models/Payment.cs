namespace Autoservice.Models;

public class Payment
{
    public int Id { get; set; }

    public int ApplicationId { get; set; }

    public decimal Amount { get; set; }

    public DateTime PaymentDate { get; set; }

    public string PaymentStatus { get; set; } = string.Empty;

    public string PaymentMethod { get; set; } = string.Empty;

    public Application? Application { get; set; }
}