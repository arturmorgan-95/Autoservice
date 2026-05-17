namespace Autoservice.Models;

public class User
{
    public int Id { get; set; }

    public int RoleId { get; set; }

    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

    public string Login { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public Role? Role { get; set; }

    public ICollection<Car> Cars { get; set; } = new List<Car>();

    public ICollection<Application> ClientApplications { get; set; } = new List<Application>();

    public ICollection<Application> AdminApplications { get; set; } = new List<Application>();

    public ICollection<ApplicationService> MasterServices { get; set; } = new List<ApplicationService>();
}