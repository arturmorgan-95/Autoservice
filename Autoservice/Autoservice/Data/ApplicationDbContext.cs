using Autoservice.Models;
using Microsoft.EntityFrameworkCore;
using System.Reflection.Emit;

namespace Autoservice.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Role> Roles => Set<Role>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Car> Cars => Set<Car>();
    public DbSet<Status> Statuses => Set<Status>();
    public DbSet<Service> Services => Set<Service>();
    public DbSet<Application> Applications => Set<Application>();
    public DbSet<ApplicationService> ApplicationsServices => Set<ApplicationService>();
    public DbSet<Payment> Payments => Set<Payment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>()
            .HasOne(u => u.Role)
            .WithMany(r => r.Users)
            .HasForeignKey(u => u.RoleId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Car>()
            .HasOne(c => c.Client)
            .WithMany(u => u.Cars)
            .HasForeignKey(c => c.ClientId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Application>()
            .HasOne(a => a.Client)
            .WithMany(u => u.ClientApplications)
            .HasForeignKey(a => a.ClientId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Application>()
            .HasOne(a => a.Admin)
            .WithMany(u => u.AdminApplications)
            .HasForeignKey(a => a.AdminId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Application>()
            .HasOne(a => a.Car)
            .WithMany(c => c.Applications)
            .HasForeignKey(a => a.CarId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Application>()
            .HasOne(a => a.Status)
            .WithMany(s => s.Applications)
            .HasForeignKey(a => a.StatusId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ApplicationService>()
            .HasOne(a => a.Application)
            .WithMany(a => a.ApplicationServices)
            .HasForeignKey(a => a.ApplicationId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ApplicationService>()
            .HasOne(a => a.Service)
            .WithMany(s => s.ApplicationServices)
            .HasForeignKey(a => a.ServiceId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ApplicationService>()
            .HasOne(a => a.Master)
            .WithMany(u => u.MasterServices)
            .HasForeignKey(a => a.MasterId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ApplicationService>()
            .HasOne(a => a.Status)
            .WithMany(s => s.ApplicationServices)
            .HasForeignKey(a => a.StatusId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Payment>()
            .HasOne(p => p.Application)
            .WithMany(a => a.Payments)
            .HasForeignKey(p => p.ApplicationId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}